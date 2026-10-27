import { Pagina, hace } from "../layout";
import type { Charla } from "../db";

export function PaginaCharla({ c }: { c: Charla }) {
  const puntos = c.puntos.split("\n").map(s => s.trim()).filter(Boolean);
  const abierta = c.estado === "abierta";
  const tema = c.tema.charAt(0).toLowerCase() + c.tema.slice(1);
  return (
    <Pagina titulo={`${c.tema}, con ${c.nombre}`} miga={tema} descripcion={c.invitacion}>
      <article class="charla">
        <div>
          <h1 class="invitacion">
            <i>{c.nombre.split(" ")[0]} abre {c.duracion} minutos</i> para hablar de {tema}.
          </h1>
          <div class="presentacion">
            <p>{c.invitacion}</p>
            {c.presentacion.split("\n").filter(Boolean).map(p => <p>{p}</p>)}
          </div>
          {puntos.length > 0 && (
            <>
              <h2 style="margin-top:2.5rem">Podemos empezar por acá</h2>
              <ul class="puntos">{puntos.map(p => <li>{p}</li>)}</ul>
            </>
          )}
          {!abierta && (
            <div class="aviso pausa-aviso">
              <p>Esta charla está en pausa. {c.nombre.split(" ")[0]} avisó que vuelve a abrir horarios más adelante. Mientras tanto, <a href="/#charlas">hay otras puertas abiertas</a>.</p>
            </div>
          )}
        </div>

        <aside class="ficha">
          <span class={`estado-charla ${c.estado}`}>{abierta ? `Abierta. Confirmada ${hace(c.confirmada_en)}.` : "En pausa"}</span>
          <dl>
            <dt>Con</dt><dd>{c.nombre}{c.perfil_url && <> (<a href={c.perfil_url} rel="noopener nofollow">quién es</a>)</>}</dd>
            <dt>Desde</dt><dd>{c.desde}</dd>
            <dt>Dura</dt><dd>{c.duracion} minutos, por videollamada, de a uno.</dd>
            <dt>Cuesta</dt><dd>Nada. Es una charla, no un servicio.</dd>
          </dl>
          {abierta
            ? <a class="boton" href={`/ir/${c.slug}`} rel="noopener">Elegir un horario <span aria-hidden="true">↗</span></a>
            : <button class="boton" disabled>Sin horarios por ahora</button>}
          <small class="nota">La agenda se abre en otra pestaña. Elegís el horario y te llega la videollamada por mail.</small>

          <div class="despues">
            <h3>Qué hay después</h3>
            {c.despues
              ? <><p>{c.despues}</p>{c.despues_url && <small><a href={c.despues_url} rel="noopener nofollow">Más sobre eso</a></small>}</>
              : <p>Nada. La charla termina cuando termina.</p>}
          </div>

          <small class="reportar meta" style="display:block"><a href={`/reportar/${c.slug}`}>Reportar un problema con esta charla</a></small>
        </aside>
      </article>
    </Pagina>
  );
}
