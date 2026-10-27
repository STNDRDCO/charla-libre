import { notFound } from "next/navigation";
import { Marco } from "@/components/Marco";
import { charlaPorSlug } from "@/lib/db";
import { reportar } from "./acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reportar un problema", robots: { index: false } };

const MOTIVOS: [string, string][] = [
  ["venta", "Era una venta encubierta o me presionaron para pagar algo."],
  ["datos", "Me pidieron contraseñas, claves o datos sensibles."],
  ["trato", "Hubo un trato irrespetuoso o acoso."],
  ["falso", "La persona no es quien dice ser o infla lo que sabe."],
  ["ausente", "Reservé y no apareció, o la agenda no tiene horarios."],
  ["otro", "Otra cosa."],
];

export default async function Reportar({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ listo?: string }> }) {
  const c = await charlaPorSlug((await params).slug);
  if (!c) notFound();
  const { listo } = await searchParams;
  return (
    <Marco miga="reportar" sinReglas>
      <section className="seccion">
        {listo ? (
          <>
            <h1>Recibido.</h1>
            <p className="intro">Lo revisamos. Si dejaste tu correo, te contamos qué hicimos. Gracias por cuidar la casa.</p>
          </>
        ) : (
          <>
            <h1>Reportar la charla «{c.tema}»</h1>
            <p className="intro">Si algo rompió los acuerdos de la casa, contanos. Lo lee una persona, no un sistema.</p>
            <form className="formulario" action={reportar}>
              <input type="hidden" name="slug" value={c.slug} />
              <fieldset>
                <legend>Qué pasó</legend>
                {MOTIVOS.map(([v, t]) => <label key={v} className="radio"><input type="radio" name="motivo" value={v} required /> {t}</label>)}
              </fieldset>
              <div className="campo">
                <label htmlFor="detalle">Contanos más <span className="opcional">(opcional)</span></label>
                <textarea id="detalle" name="detalle" maxLength={1500} />
              </div>
              <div className="campo">
                <label htmlFor="email">Tu correo <span className="opcional">(opcional)</span></label>
                <input id="email" name="email" type="email" />
              </div>
              <button className="boton" type="submit">Enviar el reporte</button>
            </form>
          </>
        )}
      </section>
    </Marco>
  );
}
