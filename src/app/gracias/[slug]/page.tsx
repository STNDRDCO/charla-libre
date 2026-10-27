import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco } from "@/components/Marco";
import { charlaPorSlug } from "@/lib/db";
import { responder } from "./acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "¿Cómo te fue?", robots: { index: false } };

export default async function Gracias({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ listo?: string }> }) {
  const c = await charlaPorSlug((await params).slug);
  if (!c) notFound();
  const { listo } = await searchParams;
  const nombre = c.nombre.split(" ")[0];
  return (
    <Marco miga="después de la charla" sinReglas>
      <section className="seccion">
        {listo ? (
          <>
            <h1>Gracias.</h1>
            <p className="intro">Le llega a {nombre} y nos sirve para saber si esto vale la pena. Si querés, <Link href="/#charlas">hay otras puertas abiertas</Link>, o <Link href="/abrir">podés abrir la tuya</Link>.</p>
          </>
        ) : (
          <>
            <h1>Hablaste con {nombre}. ¿Cómo te fue?</h1>
            <p className="intro">Dos preguntas, un minuto. No hay respuestas correctas.</p>
            <form className="formulario" action={responder}>
              <input type="hidden" name="slug" value={c.slug} />
              <fieldset>
                <legend>¿Valió la pena?</legend>
                <label className="radio"><input type="radio" name="valio" value="1" required /> Sí, me sirvió.</label>
                <label className="radio"><input type="radio" name="valio" value="0" /> No mucho.</label>
              </fieldset>
              <div className="campo">
                <label htmlFor="comentario">Si querés, contá por qué <span className="opcional">(opcional)</span></label>
                <textarea id="comentario" name="comentario" maxLength={600} style={{ minHeight: "5rem" }} />
              </div>
              <div className="campo">
                <label htmlFor="de_que">Y vos, ¿de qué podrías hablar media hora con alguien? <span className="opcional">(opcional)</span></label>
                <span className="ayuda">Algo que viviste, que sabés o que te gusta. No hace falta ser experto. Si respondés, {nombre} puede escribirte para ayudarte a abrir tu charla.</span>
                <input id="de_que" name="de_que" type="text" maxLength={160} />
              </div>
              <div className="campo">
                <label htmlFor="email">Tu correo <span className="opcional">(opcional, solo si querés que te escriban)</span></label>
                <input id="email" name="email" type="email" />
              </div>
              <button className="boton" type="submit">Enviar</button>
            </form>
          </>
        )}
      </section>
    </Marco>
  );
}
