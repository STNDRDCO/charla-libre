import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco } from "@/components/Marco";
import { Formulario } from "@/components/Formulario";
import { charlaPorToken, stats, hace, fecha, diasDesde } from "@/lib/db";
import { BASE_URL } from "@/lib/mail";
import { confirmar, pausar, reabrir, retirar, editar } from "./acciones";
import { Retirar } from "./Retirar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tu panel", robots: { index: false } };

export default async function Panel({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ m?: string }> }) {
  const { token } = await params;
  const { m } = await searchParams;
  const c = await charlaPorToken(token);
  if (!c) notFound();
  const s = await stats(c.id);
  const pagina = `${BASE_URL}/c/${c.slug}`;
  const porcentaje = s.respuestas ? Math.round((s.valio / s.respuestas) * 100) : null;
  const sinConfirmar = diasDesde(c.confirmada_en);
  const T = <input type="hidden" name="token" value={c.token} />;

  return (
    <Marco miga="tu panel" sinReglas>
      <header className="panel-cabeza">
        <div>
          <small className="meta">Panel de {c.nombre}</small>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}>{c.tema}</h1>
        </div>
        <div className="acciones" style={{ margin: 0 }}>
          <Link className="boton chico secundario" href={`/c/${c.slug}`}>Ver mi página</Link>
        </div>
      </header>

      {m && <div className="aviso"><p>{m}</p></div>}
      {c.estado === "retirada" && <div className="aviso error"><p>Esta charla está retirada: no aparece en la lista ni se puede reservar. Si querés volver, editala y guardá los cambios acá abajo.</p></div>}
      {c.estado !== "retirada" && sinConfirmar >= 21 && (
        <div className="aviso">
          <p>Hace {sinConfirmar} días que no confirmás que seguís abierto. En la lista se muestra la fecha de tu última confirmación; una charla vieja sin confirmar genera desconfianza. ¿Seguís?</p>
          <form action={confirmar}>{T}<button className="boton chico">Sí, sigo abierto</button></form>
        </div>
      )}

      <div className="cifras">
        <div className="cifra"><b>{s.clics}</b><span>veces que alguien fue a tu agenda ({s.clics30} en los últimos 30 días)</span></div>
        <div className="cifra"><b>{s.reservas}</b><span>reservas, según tu agenda ({s.canceladas} canceladas)</span></div>
        <div className="cifra"><b>{s.terminadas}</b><span>charlas que efectivamente sucedieron</span></div>
        <div className="cifra"><b>{porcentaje === null ? "—" : `${porcentaje}%`}</b><span>{s.respuestas ? `de ${s.respuestas} que respondieron dicen que valió la pena` : "todavía nadie respondió si valió la pena"}</span></div>
      </div>

      <div className="acciones">
        <form action={confirmar}>{T}<button className="boton chico secundario">Sigo abierto</button></form>
        {c.estado === "abierta" && <form action={pausar}>{T}<button className="boton chico secundario">Pausar la charla</button></form>}
        {c.estado === "pausada" && <form action={reabrir}>{T}<button className="boton chico">Volver a abrir</button></form>}
        {c.estado !== "retirada" && <Retirar accion={retirar} token={c.token} />}
      </div>
      <small className="meta">Estado: {c.estado}. Última confirmación {hace(c.confirmada_en)}. Publicada el {fecha(c.creada_en)}.</small>

      <h2>Tu página</h2>
      <p>Compartila donde está tu gente. Para saber de dónde llega cada persona, agregá <code>?de=</code> y una palabra al enlace, por ejemplo <code>{pagina}?de=instagram</code>. Las entradas quedan contadas por origen.</p>
      <span className="codigo">{pagina}</span>

      <h2>Manos levantadas</h2>
      <p>Después de cada charla, le preguntamos a la persona de qué podría hablar ella media hora con alguien. Estas son las respuestas. Son tus próximos anfitriones; escribiles.</p>
      {s.manos.length === 0
        ? <p><em>Todavía ninguna. Aparecen cuando alguien completa la respuesta de después de la charla.</em></p>
        : <ul className="lista-simple">{s.manos.map((x, i) => <li key={i}>{x.de_que}<small className="meta">{x.email ?? "sin correo"}, {fecha(x.creada_en)}</small></li>)}</ul>}

      {s.comentarios.length > 0 && (
        <>
          <h2>Lo que dijeron</h2>
          <ul className="lista-simple">{s.comentarios.map((r, i) => <li key={i}>{r.comentario}<small className="meta">{r.valio === true ? "Valió la pena." : r.valio === false ? "No le sirvió." : ""} {fecha(r.creada_en)}</small></li>)}</ul>
        </>
      )}

      <h2>Conectar tu agenda</h2>
      <p>Los clics los contamos solos. Para que el panel sepa qué reservas se hicieron y cuáles sucedieron, tu agenda tiene que avisarle a esta página. Son dos minutos, una sola vez.</p>
      <details>
        <summary>Si usás Cal.com</summary>
        <ol>
          <li>En Cal.com, entrá a <em>Settings, Developer, Webhooks</em> y creá uno nuevo.</li>
          <li>Pegá esta dirección como <em>Subscriber URL</em>:<span className="codigo">{BASE_URL}/api/agenda/calcom/{c.slug}</span></li>
          <li>Pegá esta clave en <em>Secret</em>:<span className="codigo">{c.token}</span></li>
          <li>Marcá los eventos <em>Booking created</em>, <em>Booking cancelled</em> y <em>Meeting ended</em>. Guardá.</li>
        </ol>
        <p>En el correo de confirmación de tu evento, agregá este enlace para que la persona pueda contarte cómo le fue:<span className="codigo">{BASE_URL}/gracias/{c.slug}</span></p>
      </details>
      <details>
        <summary>Si usás Calendly</summary>
        <p>Calendly solo manda avisos en los planes pagos. Si tenés uno, creá un webhook en <em>Integrations, API &amp; Webhooks</em> apuntando a <span className="codigo">{BASE_URL}/api/agenda/calendly/{c.slug}?clave={c.token}</span> con los eventos <em>invitee.created</em> e <em>invitee.canceled</em>. Si no, el panel va a contar clics y respuestas, pero no reservas; también podés pasarte a Cal.com, que es gratis.</p>
      </details>

      <h2>Editar la charla</h2>
      <Formulario accion={editar} token={c.token} editar inicial={{ nombre: c.nombre, desde: c.desde, tema: c.tema, invitacion: c.invitacion, presentacion: c.presentacion, puntos: c.puntos, duracion: String(c.duracion), agenda_url: c.agenda_url, perfil_url: c.perfil_url ?? "", despues: c.despues ?? "", despues_url: c.despues_url ?? "" }} />
    </Marco>
  );
}
