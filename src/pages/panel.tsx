import { Pagina, BASE_URL, hace, fecha } from "../layout";
import type { Charla } from "../db";
import { Formulario } from "./abrir";

type Stats = ReturnType<typeof import("../db").q.stats>;

export function Panel({ c, s, mensaje }: { c: Charla; s: Stats; mensaje?: string }) {
  const base = `/panel/${c.token}`;
  const pagina = `${BASE_URL}/c/${c.slug}`;
  const porcentaje = s.respuestas ? Math.round((s.valio / s.respuestas) * 100) : null;
  const diasSinConfirmar = Math.floor((Date.now() - new Date(c.confirmada_en.replace(" ", "T") + "Z").getTime()) / 86400000);
  return (
    <Pagina titulo="Tu panel" miga="tu panel" sinReglas>
      <header class="panel-cabeza">
        <div>
          <small class="meta">Panel de {c.nombre}</small>
          <h1 style="font-size:clamp(1.8rem,4vw,2.8rem)">{c.tema}</h1>
        </div>
        <div class="acciones" style="margin:0">
          <a class="boton chico secundario" href={`/c/${c.slug}`}>Ver mi página</a>
        </div>
      </header>

      {mensaje && <div class="aviso"><p>{mensaje}</p></div>}

      {c.estado === "retirada" && (
        <div class="aviso error"><p>Esta charla está retirada: no aparece en la lista ni se puede reservar. Si querés volver, editala y publicala de nuevo desde acá abajo.</p></div>
      )}
      {c.estado !== "retirada" && diasSinConfirmar >= 21 && (
        <div class="aviso">
          <p>Hace {diasSinConfirmar} días que no confirmás que seguís abierto. En la lista se muestra la fecha de tu última confirmación; una charla vieja sin confirmar genera desconfianza. ¿Seguís?</p>
          <form method="post" action={`${base}/confirmar`}><button class="boton chico">Sí, sigo abierto</button></form>
        </div>
      )}

      <div class="cifras">
        <div class="cifra"><b>{s.clics}</b><span>veces que alguien fue a tu agenda ({s.clics30} en los últimos 30 días)</span></div>
        <div class="cifra"><b>{s.reservas}</b><span>reservas, según tu agenda ({s.canceladas} canceladas)</span></div>
        <div class="cifra"><b>{s.terminadas}</b><span>charlas que efectivamente sucedieron</span></div>
        <div class="cifra"><b>{porcentaje === null ? "—" : `${porcentaje}%`}</b><span>{s.respuestas ? `de ${s.respuestas} que respondieron dicen que valió la pena` : "todavía nadie respondió si valió la pena"}</span></div>
      </div>

      <div class="acciones">
        <form method="post" action={`${base}/confirmar`}><button class="boton chico secundario">Sigo abierto</button></form>
        {c.estado === "abierta" && <form method="post" action={`${base}/pausar`}><button class="boton chico secundario">Pausar la charla</button></form>}
        {c.estado === "pausada" && <form method="post" action={`${base}/reabrir`}><button class="boton chico">Volver a abrir</button></form>}
        {c.estado !== "retirada" && <form method="post" action={`${base}/retirar`} onsubmit="return confirm('¿Retirar la charla? Deja de aparecer y no se puede reservar. Podés volver cuando quieras.')"><button class="boton chico peligro">Retirar</button></form>}
      </div>
      <small class="meta">Estado: {c.estado}. Última confirmación {hace(c.confirmada_en)}. Publicada el {fecha(c.creada_en)}.</small>

      <h2>Tu página</h2>
      <p>Compartila donde está tu gente. Para saber de dónde llega cada persona, agregá <code>?de=</code> y una palabra al enlace, por ejemplo <code>{pagina}?de=instagram</code>. Las entradas quedan contadas por origen.</p>
      <span class="codigo">{pagina}</span>

      <h2>Manos levantadas</h2>
      <p>Después de cada charla, le preguntamos a la persona de qué podría hablar ella media hora con alguien. Estas son las respuestas. Son tus próximos anfitriones; escribiles.</p>
      {s.manos.length === 0
        ? <p><em>Todavía ninguna. Aparecen cuando alguien completa la respuesta de después de la charla.</em></p>
        : <ul class="lista-simple">{s.manos.map(m => <li>{m.de_que}<small class="meta">{m.email ?? "sin correo"}, {fecha(m.creada_en)}</small></li>)}</ul>}

      {s.comentarios.length > 0 && (
        <>
          <h2>Lo que dijeron</h2>
          <ul class="lista-simple">{s.comentarios.map(r => <li>{r.comentario}<small class="meta">{r.valio === 1 ? "Valió la pena." : r.valio === 0 ? "No le sirvió." : ""} {fecha(r.creada_en)}</small></li>)}</ul>
        </>
      )}

      <h2>Conectar tu agenda</h2>
      <p>Los clics los contamos solos. Para que el panel sepa qué reservas se hicieron y cuáles sucedieron, tu agenda tiene que avisarle a esta página. Son dos minutos, una sola vez.</p>
      <details>
        <summary>Si usás Cal.com</summary>
        <ol>
          <li>En Cal.com, entrá a <em>Settings, Developer, Webhooks</em> y creá uno nuevo.</li>
          <li>Pegá esta dirección como <em>Subscriber URL</em>:<span class="codigo">{BASE_URL}/api/agenda/calcom/{c.slug}</span></li>
          <li>Pegá esta clave en <em>Secret</em>:<span class="codigo">{c.token}</span></li>
          <li>Marcá los eventos <em>Booking created</em>, <em>Booking cancelled</em> y <em>Meeting ended</em>. Guardá.</li>
        </ol>
        <p>En el correo de confirmación de tu evento, agregá este enlace para que la persona pueda contarte cómo le fue:<span class="codigo">{BASE_URL}/gracias/{c.slug}</span></p>
      </details>
      <details>
        <summary>Si usás Calendly</summary>
        <p>Calendly solo manda avisos en los planes pagos. Si tenés uno, creá un webhook en <em>Integrations, API &amp; Webhooks</em> apuntando a <span class="codigo">{BASE_URL}/api/agenda/calendly/{c.slug}?clave={c.token}</span> con los eventos <em>invitee.created</em> e <em>invitee.canceled</em>. Si no, el panel va a contar clics y respuestas, pero no reservas; también podés pasarte a Cal.com, que es gratis.</p>
      </details>

      <h2>Editar la charla</h2>
      <Formulario d={{ ...c, duracion: String(c.duracion), perfil_url: c.perfil_url ?? "", despues: c.despues ?? "", despues_url: c.despues_url ?? "" }} accion={`${base}/editar`} editar />
    </Pagina>
  );
}
