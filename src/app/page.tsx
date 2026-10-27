import Link from "next/link";
import { Marco } from "@/components/Marco";
import { catalogo, hace } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Portada() {
  const charlas = await catalogo();
  const abiertas = charlas.filter(c => c.estado === "abierta").length;
  return (
    <Marco>
      <section className="portada">
        <div>
          <h1>Alguien ya decidió hacerte un lugar.</h1>
          <p className="lema">Personas que abren media hora para hablar de lo que les importa. Vos elegís el tema, reservás un horario y conversan. Gratis.</p>
        </div>
        <div className="como">
          <p>No hace falta llegar con una buena pregunta. Alcanza con «esto me está dando vueltas y quería hablarlo con alguien».</p>
          <p>Y si lo tuyo es escuchar, <Link href="/abrir">abrí tu propia charla</Link>: lleva cinco minutos y se publica sola.</p>
        </div>
      </section>

      <section className="catalogo" id="charlas">
        <header>
          <h2>Puertas abiertas</h2>
          <small className="meta">{abiertas === 1 ? "1 charla abierta" : `${abiertas} charlas abiertas`}</small>
        </header>
        {charlas.length === 0 && <p className="vacio">Todavía no hay charlas publicadas. <Link href="/abrir">Abrí la primera.</Link></p>}
        {charlas.map(c => (
          <Link key={c.id} className={`puerta ${c.estado}`} href={`/c/${c.slug}`}>
            <span className="marco-puerta" aria-hidden="true"></span>
            <span>
              <span className="tema">{c.tema}</span>
              <span className="quien" style={{ display: "block" }}>Con {c.nombre}. {c.desde}</span>
            </span>
            <span className="estado">
              <b>{c.estado === "abierta" ? "Abierta." : "En pausa."}</b>{" "}
              {c.estado === "abierta" ? `${c.duracion} minutos. Confirmada ${hace(c.confirmada_en)}.` : "Vuelve pronto."}
            </span>
            <span className="ir">Ver la invitación</span>
          </Link>
        ))}
      </section>
    </Marco>
  );
}
