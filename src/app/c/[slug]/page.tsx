import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Marco } from "@/components/Marco";
import { charlaPorSlug, hace } from "@/lib/db";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await charlaPorSlug((await params).slug);
  if (!c || c.estado === "retirada") return { title: "No está" };
  return { title: `${c.tema}, con ${c.nombre}`, description: c.invitacion };
}

export default async function PaginaCharla({ params }: Props) {
  const c = await charlaPorSlug((await params).slug);
  if (!c || c.estado === "retirada") notFound();
  const puntos = c.puntos.split("\n").map(s => s.trim()).filter(Boolean);
  const abierta = c.estado === "abierta";
  const tema = c.tema.charAt(0).toLowerCase() + c.tema.slice(1);
  const nombre = c.nombre.split(" ")[0];
  return (
    <Marco miga={tema}>
      <article className="charla">
        <div>
          <h1 className="invitacion"><i>{nombre} abre {c.duracion} minutos</i> para hablar de {tema}.</h1>
          <div className="presentacion">
            <p>{c.invitacion}</p>
            {c.presentacion.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {puntos.length > 0 && (
            <>
              <h2 style={{ marginTop: "2.5rem" }}>Podemos empezar por acá</h2>
              <ul className="puntos">{puntos.map(p => <li key={p}>{p}</li>)}</ul>
            </>
          )}
          {!abierta && (
            <div className="aviso pausa-aviso">
              <p>Esta charla está en pausa. {nombre} avisó que vuelve a abrir horarios más adelante. Mientras tanto, <Link href="/#charlas">hay otras puertas abiertas</Link>.</p>
            </div>
          )}
        </div>

        <aside className="ficha">
          <span className={`estado-charla ${c.estado}`}>{abierta ? `Abierta. Confirmada ${hace(c.confirmada_en)}.` : "En pausa"}</span>
          <dl>
            <dt>Con</dt><dd>{c.nombre}{c.perfil_url && <> (<a href={c.perfil_url} rel="noopener nofollow">quién es</a>)</>}</dd>
            <dt>Desde</dt><dd>{c.desde}</dd>
            <dt>Dura</dt><dd>{c.duracion} minutos, por videollamada, de a uno.</dd>
            <dt>Cuesta</dt><dd>Nada. Es una charla, no un servicio.</dd>
          </dl>
          {abierta
            ? <a className="boton" href={`/ir/${c.slug}`} target="_blank" rel="noopener">Elegir un horario <span aria-hidden="true">↗</span></a>
            : <button className="boton" disabled>Sin horarios por ahora</button>}
          <small className="nota">La agenda se abre en otra pestaña. Elegís el horario y te llega la videollamada por mail.</small>

          <div className="despues">
            <h3>Qué hay después</h3>
            {c.despues
              ? <><p>{c.despues}</p>{c.despues_url && <small><a href={c.despues_url} rel="noopener nofollow">Más sobre eso</a></small>}</>
              : <p>Nada. La charla termina cuando termina.</p>}
          </div>

          <small className="reportar meta" style={{ display: "block" }}><Link href={`/reportar/${c.slug}`}>Reportar un problema con esta charla</Link></small>
        </aside>
      </article>
    </Marco>
  );
}
