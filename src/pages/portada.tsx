import { Pagina, hace } from "../layout";
import type { Charla } from "../db";

export function Portada({ charlas }: { charlas: Charla[] }) {
  const abiertas = charlas.filter(c => c.estado === "abierta").length;
  return (
    <Pagina descripcion="Personas que abren un rato de su tiempo para conversar con vos. Gratis, por videollamada, con un tema para empezar.">
      <section class="portada">
        <div>
          <h1>Alguien ya decidió hacerte un lugar.</h1>
          <p class="lema">Personas que abren media hora para hablar de lo que les importa. Vos elegís el tema, reservás un horario y conversan. Gratis.</p>
        </div>
        <div class="como">
          <p>No hace falta llegar con una buena pregunta. Alcanza con «esto me está dando vueltas y quería hablarlo con alguien».</p>
          <p>Y si lo tuyo es escuchar, <a href="/abrir">abrí tu propia charla</a>: lleva cinco minutos y se publica sola.</p>
        </div>
      </section>

      <section class="catalogo" id="charlas">
        <header>
          <h2>Puertas abiertas</h2>
          <small class="meta">{abiertas === 1 ? "1 charla abierta" : `${abiertas} charlas abiertas`}</small>
        </header>
        {charlas.length === 0 && <p class="vacio">Todavía no hay charlas publicadas. <a href="/abrir">Abrí la primera.</a></p>}
        {charlas.map(c => (
          <a class={`puerta ${c.estado}`} href={`/c/${c.slug}`}>
            <span class="marco-puerta" aria-hidden="true"></span>
            <span>
              <span class="tema">{c.tema}</span>
              <span class="quien" style="display:block">Con {c.nombre}. {c.desde}</span>
            </span>
            <span class="estado">
              <b>{c.estado === "abierta" ? "Abierta." : "En pausa."}</b>{" "}
              {c.estado === "abierta" ? `${c.duracion} minutos. Confirmada ${hace(c.confirmada_en)}.` : "Vuelve pronto."}
            </span>
            <span class="ir">Ver la invitación</span>
          </a>
        ))}
      </section>
    </Pagina>
  );
}
