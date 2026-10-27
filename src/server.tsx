import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db, q, nuevoToken, slugLibre, type Charla } from "./db";
import { enviar, avisarAdmin } from "./mail";
import { BASE_URL, Pagina, fecha } from "./layout";
import { Portada } from "./pages/portada";
import { PaginaCharla } from "./pages/charla";
import { Abrir, Publicada, type Datos } from "./pages/abrir";
import { Panel } from "./pages/panel";
import { Gracias, Reportar, NoEncontrada } from "./pages/otras";

const app = new Hono();
app.use("/*", serveStatic({ root: "./public" }));

const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const urlValida = (u: string) => { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch { return false; } };

function leerDatos(body: Record<string, unknown>): { d: Datos; errores: string[] } {
  const d: Datos = {
    nombre: texto(body.nombre, 60), email: texto(body.email, 120).toLowerCase(), perfil_url: texto(body.perfil_url, 300),
    desde: texto(body.desde, 120), tema: texto(body.tema, 60), invitacion: texto(body.invitacion, 300),
    presentacion: texto(body.presentacion, 1500), puntos: texto(body.puntos, 600), duracion: texto(body.duracion, 3),
    agenda_url: texto(body.agenda_url, 300), despues: texto(body.despues, 400), despues_url: texto(body.despues_url, 300),
  };
  const e: string[] = [];
  if (d.nombre!.length < 2) e.push("Tu nombre.");
  if (d.desde!.length < 5) e.push("Desde dónde hablás.");
  if (d.tema!.length < 3) e.push("El tema.");
  if (d.invitacion!.length < 15) e.push("La invitación, aunque sea una frase.");
  if (d.presentacion!.length < 40) e.push("Quién sos y por qué abrís esto, un poco más largo.");
  if (!["20", "30", "45", "60"].includes(d.duracion!)) d.duracion = "30";
  if (!urlValida(d.agenda_url!) || !/cal\.com|calendly\.com|zcal|tidycal|youcanbook|savvycal/i.test(d.agenda_url!)) e.push("Un enlace de agenda que funcione (Cal.com, Calendly u otra agenda con horarios).");
  if (d.perfil_url && !urlValida(d.perfil_url)) e.push("El enlace de tu perfil no parece un enlace.");
  if (d.despues_url && !urlValida(d.despues_url)) e.push("El enlace de «qué hay después» no parece un enlace.");
  if (d.despues_url && !d.despues) e.push("Si ponés un enlace en «qué hay después», contá qué es.");
  return { d, errores: e };
}

// ---------- Portada y charla ----------
app.get("/", c => c.html(<Portada charlas={q.catalogo()} />));

app.get("/c/:slug", c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch || ch.estado === "retirada") return c.html(<NoEncontrada />, 404);
  return c.html(<PaginaCharla c={ch} />);
});

// El enlace medido: cuenta y manda a la agenda.
app.get("/ir/:slug", c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch || ch.estado !== "abierta") return c.html(<NoEncontrada />, 404);
  const de = texto(c.req.query("de"), 40);
  const origen = de || (c.req.header("referer")?.startsWith(BASE_URL) ? "catalogo" : null);
  db.prepare("INSERT INTO clics (charla_id, origen) VALUES (?, ?)").run(ch.id, origen);
  return c.redirect(ch.agenda_url, 302);
});

// ---------- Abrir una charla ----------
app.get("/abrir", c => c.html(<Abrir />));

app.post("/abrir", async c => {
  const body = await c.req.parseBody();
  if (body.web) return c.body(null, 204); // trampa para bots
  const { d, errores } = leerDatos(body);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email!)) errores.push("Un correo al que podamos escribirte.");
  if (errores.length) return c.html(<Abrir d={d} errores={errores} />, 422);

  const slug = slugLibre(d.nombre!), token = nuevoToken();
  db.prepare(`INSERT INTO charlas (slug, token, nombre, email, perfil_url, desde, tema, invitacion, presentacion, puntos, duracion, agenda_url, despues, despues_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    slug, token, d.nombre!, d.email!, d.perfil_url || null, d.desde!, d.tema!, d.invitacion!, d.presentacion!, d.puntos!,
    Number(d.duracion), d.agenda_url!, d.despues || null, d.despues_url || null);
  const ch = q.charlaPorSlug(slug)!;

  void enviar(ch.email, `Tu charla «${ch.tema}» está publicada`,
    `Hola ${ch.nombre.split(" ")[0]}.\n\nTu charla ya está abierta en ${BASE_URL}/c/${ch.slug}\n\nEste es tu panel. Guardalo y no lo compartas: desde acá editás, pausás o retirás la charla.\n${BASE_URL}/panel/${ch.token}\n\nGracias por abrir un rato para alguien.\nCharla Libre`);
  void avisarAdmin(`Nueva charla: ${ch.tema} (${ch.nombre})`, `${BASE_URL}/c/${ch.slug}\n\nDesde: ${ch.desde}\nAgenda: ${ch.agenda_url}\nDespués: ${ch.despues ?? "nada"}`);
  return c.html(<Publicada c={ch} />);
});

// ---------- Panel del anfitrión ----------
const conPanel = (fn: (c: any, ch: Charla) => Response | Promise<Response>) => (c: any) => {
  const ch = q.charlaPorToken(c.req.param("token"));
  if (!ch) return c.html(<NoEncontrada />, 404);
  return fn(c, ch);
};
const volver = (ch: Charla, mensaje: string) => `/panel/${ch.token}?m=${encodeURIComponent(mensaje)}`;

app.get("/panel/:token", conPanel((c, ch) => c.html(<Panel c={ch} s={q.stats(ch.id)} mensaje={c.req.query("m")} />)));

app.post("/panel/:token/confirmar", conPanel((c, ch) => {
  db.prepare("UPDATE charlas SET confirmada_en = datetime('now') WHERE id = ?").run(ch.id);
  return c.redirect(volver(ch, "Confirmado. En la lista figura que seguís abierto."));
}));
app.post("/panel/:token/pausar", conPanel((c, ch) => {
  db.prepare("UPDATE charlas SET estado = 'pausada', editada_en = datetime('now') WHERE id = ?").run(ch.id);
  return c.redirect(volver(ch, "Charla en pausa. Sigue en la lista, marcada como en pausa, sin botón de reserva."));
}));
app.post("/panel/:token/reabrir", conPanel((c, ch) => {
  db.prepare("UPDATE charlas SET estado = 'abierta', confirmada_en = datetime('now'), editada_en = datetime('now') WHERE id = ?").run(ch.id);
  return c.redirect(volver(ch, "Abierta de nuevo."));
}));
app.post("/panel/:token/retirar", conPanel((c, ch) => {
  db.prepare("UPDATE charlas SET estado = 'retirada', editada_en = datetime('now') WHERE id = ?").run(ch.id);
  return c.redirect(volver(ch, "Charla retirada. Ya no aparece. Si querés volver, guardá los cambios en el formulario y se vuelve a publicar."));
}));
app.post("/panel/:token/editar", conPanel(async (c, ch) => {
  const { d, errores } = leerDatos(await c.req.parseBody());
  if (errores.length) return c.html(<Panel c={ch} s={q.stats(ch.id)} mensaje={"No se guardó: " + errores.join(" ")} />, 422);
  const estado = ch.estado === "retirada" ? "abierta" : ch.estado;
  db.prepare(`UPDATE charlas SET nombre=?, perfil_url=?, desde=?, tema=?, invitacion=?, presentacion=?, puntos=?, duracion=?, agenda_url=?, despues=?, despues_url=?, estado=?, editada_en=datetime('now') WHERE id=?`)
    .run(d.nombre!, d.perfil_url || null, d.desde!, d.tema!, d.invitacion!, d.presentacion!, d.puntos!, Number(d.duracion), d.agenda_url!, d.despues || null, d.despues_url || null, estado, ch.id);
  return c.redirect(volver(ch, estado !== ch.estado ? "Guardado y publicada de nuevo." : "Guardado."));
}));

// ---------- Después de la charla ----------
app.get("/gracias/:slug", c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch) return c.html(<NoEncontrada />, 404);
  return c.html(<Gracias c={ch} />);
});
app.post("/gracias/:slug", async c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch) return c.html(<NoEncontrada />, 404);
  const b = await c.req.parseBody();
  const valio = b.valio === "1" ? 1 : b.valio === "0" ? 0 : null;
  const de_que = texto(b.de_que, 160) || null, comentario = texto(b.comentario, 600) || null, email = texto(b.email, 120) || null;
  db.prepare("INSERT INTO respuestas (charla_id, quien, valio, comentario, de_que, email) VALUES (?, 'visitante', ?, ?, ?, ?)").run(ch.id, valio, comentario, de_que, email);
  if (de_que || comentario) void enviar(ch.email, `Alguien respondió después de tu charla`,
    `${valio === 1 ? "Dijo que valió la pena." : valio === 0 ? "Dijo que no le sirvió mucho." : ""}\n${comentario ? `\n«${comentario}»\n` : ""}${de_que ? `\nLevantó la mano: podría hablar de «${de_que}».${email ? ` Su correo: ${email}` : ""}\n` : ""}\nTodo está en tu panel: ${BASE_URL}/panel/${ch.token}`);
  return c.html(<Gracias c={ch} listo />);
});

// ---------- Reportes ----------
app.get("/reportar/:slug", c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch) return c.html(<NoEncontrada />, 404);
  return c.html(<Reportar c={ch} />);
});
app.post("/reportar/:slug", async c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch) return c.html(<NoEncontrada />, 404);
  const b = await c.req.parseBody();
  const motivo = texto(b.motivo, 20) || "otro", detalle = texto(b.detalle, 1500) || null, email = texto(b.email, 120) || null;
  db.prepare("INSERT INTO reportes (charla_id, motivo, detalle, email) VALUES (?, ?, ?, ?)").run(ch.id, motivo, detalle, email);
  void avisarAdmin(`Reporte sobre «${ch.tema}» (${motivo})`, `${BASE_URL}/c/${ch.slug}\n\n${detalle ?? "(sin detalle)"}\n\nDe: ${email ?? "anónimo"}\nPanel de administración: ${BASE_URL}/admin/${process.env.ADMIN_TOKEN ?? ""}`);
  return c.html(<Reportar c={ch} listo />);
});

// ---------- Avisos de la agenda (webhooks) ----------
function registrar(ch: Charla, externo: string | null, estado: "creada" | "cancelada" | "terminada", inicio: string | null) {
  db.prepare(`INSERT INTO reservas (charla_id, externo_id, estado, inicio) VALUES (?, ?, ?, ?)
    ON CONFLICT(charla_id, externo_id) DO UPDATE SET estado = excluded.estado, inicio = COALESCE(excluded.inicio, inicio)`)
    .run(ch.id, externo, estado, inicio);
}

app.post("/api/agenda/calcom/:slug", async c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch) return c.json({ ok: false }, 404);
  const crudo = await c.req.text();
  const firma = c.req.header("x-cal-signature-256") ?? "";
  const esperada = createHmac("sha256", ch.token).update(crudo).digest("hex");
  if (firma.length !== esperada.length || !timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return c.json({ ok: false, motivo: "firma" }, 401);
  const ev = JSON.parse(crudo) as { triggerEvent?: string; payload?: { uid?: string; startTime?: string } };
  const mapa: Record<string, "creada" | "cancelada" | "terminada"> = { BOOKING_CREATED: "creada", BOOKING_CANCELLED: "cancelada", MEETING_ENDED: "terminada" };
  const estado = mapa[ev.triggerEvent ?? ""];
  if (!estado) return c.json({ ok: true, ignorado: ev.triggerEvent });
  registrar(ch, ev.payload?.uid ?? null, estado, ev.payload?.startTime ?? null);
  return c.json({ ok: true });
});

app.post("/api/agenda/calendly/:slug", async c => {
  const ch = q.charlaPorSlug(c.req.param("slug"));
  if (!ch || c.req.query("clave") !== ch.token) return c.json({ ok: false }, 401);
  const ev = await c.req.json() as { event?: string; payload?: { uri?: string; scheduled_event?: { uri?: string; start_time?: string } } };
  const estado = ev.event === "invitee.created" ? "creada" : ev.event === "invitee.canceled" ? "cancelada" : null;
  if (!estado) return c.json({ ok: true, ignorado: ev.event });
  registrar(ch, ev.payload?.scheduled_event?.uri ?? ev.payload?.uri ?? null, estado, ev.payload?.scheduled_event?.start_time ?? null);
  return c.json({ ok: true });
});

// ---------- Administración mínima (reportes y retiro) ----------
const ADMIN = process.env.ADMIN_TOKEN;
app.get("/admin/:token", c => {
  if (!ADMIN || c.req.param("token") !== ADMIN) return c.html(<NoEncontrada />, 404);
  const charlas = db.prepare("SELECT * FROM charlas ORDER BY creada_en DESC").all() as Charla[];
  const reportes = db.prepare("SELECT r.*, ch.tema, ch.slug FROM reportes r JOIN charlas ch ON ch.id = r.charla_id ORDER BY r.resuelto, r.creado_en DESC").all() as any[];
  return c.html(
    <Pagina titulo="Administración" miga="casa" sinReglas>
      <section class="seccion">
        <h1>La casa, por dentro.</h1>
        <h2>Reportes</h2>
        {reportes.length === 0 ? <p>Ninguno.</p> : (
          <ul class="lista-simple">{reportes.map(r => (
            <li>
              <b>{r.motivo}</b> sobre <a href={`/c/${r.slug}`}>{r.tema}</a>{r.resuelto ? " (resuelto)" : ""}
              {r.detalle && <p style="margin:.3rem 0 0">{r.detalle}</p>}
              <small class="meta">{r.email ?? "anónimo"}, {fecha(r.creado_en)}</small>
              {!r.resuelto && <form method="post" action={`/admin/${ADMIN}/resolver/${r.id}`} style="margin-top:.5rem"><button class="boton chico secundario">Marcar resuelto</button></form>}
            </li>
          ))}</ul>
        )}
        <h2>Charlas</h2>
        <ul class="lista-simple">{charlas.map(ch => (
          <li>
            <a href={`/c/${ch.slug}`}>{ch.tema}</a>, {ch.nombre} ({ch.estado})
            <small class="meta">{ch.email}. Creada {fecha(ch.creada_en)}. Panel: <a href={`/panel/${ch.token}`}>abrir</a>.</small>
            {ch.estado !== "retirada" && <form method="post" action={`/admin/${ADMIN}/retirar/${ch.id}`} style="margin-top:.5rem"><button class="boton chico peligro">Retirar</button></form>}
          </li>
        ))}</ul>
      </section>
    </Pagina>
  );
});
app.post("/admin/:token/resolver/:id", c => {
  if (!ADMIN || c.req.param("token") !== ADMIN) return c.text("", 404);
  db.prepare("UPDATE reportes SET resuelto = 1 WHERE id = ?").run(Number(c.req.param("id")));
  return c.redirect(`/admin/${ADMIN}`);
});
app.post("/admin/:token/retirar/:id", c => {
  if (!ADMIN || c.req.param("token") !== ADMIN) return c.text("", 404);
  db.prepare("UPDATE charlas SET estado = 'retirada' WHERE id = ?").run(Number(c.req.param("id")));
  return c.redirect(`/admin/${ADMIN}`);
});

app.notFound(c => c.html(<NoEncontrada />, 404));

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => console.log(`Charla Libre escuchando en http://localhost:${port}`));
