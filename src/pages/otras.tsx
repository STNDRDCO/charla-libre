import { Pagina } from "../layout";
import type { Charla } from "../db";

export function Gracias({ c, listo }: { c: Charla; listo?: boolean }) {
  const nombre = c.nombre.split(" ")[0];
  return (
    <Pagina titulo="¿Cómo te fue?" miga="después de la charla" sinReglas>
      <section class="seccion">
        {listo ? (
          <>
            <h1>Gracias.</h1>
            <p class="intro">Le llega a {nombre} y nos sirve para saber si esto vale la pena. Si querés, <a href="/#charlas">hay otras puertas abiertas</a>, o <a href="/abrir">podés abrir la tuya</a>.</p>
          </>
        ) : (
          <>
            <h1>Hablaste con {nombre}. ¿Cómo te fue?</h1>
            <p class="intro">Dos preguntas, un minuto. No hay respuestas correctas.</p>
            <form class="formulario" method="post" action={`/gracias/${c.slug}`}>
              <fieldset>
                <legend>¿Valió la pena?</legend>
                <label class="radio"><input type="radio" name="valio" value="1" required /> Sí, me sirvió.</label>
                <label class="radio"><input type="radio" name="valio" value="0" /> No mucho.</label>
              </fieldset>
              <div class="campo">
                <label for="comentario">Si querés, contá por qué <span class="opcional">(opcional)</span></label>
                <textarea id="comentario" name="comentario" maxlength={600} style="min-height:5rem"></textarea>
              </div>
              <div class="campo">
                <label for="de_que">Y vos, ¿de qué podrías hablar media hora con alguien? <span class="opcional">(opcional)</span></label>
                <span class="ayuda">Algo que viviste, que sabés o que te gusta. No hace falta ser experto. Si respondés, {nombre} puede escribirte para ayudarte a abrir tu charla.</span>
                <input id="de_que" name="de_que" type="text" maxlength={160} />
              </div>
              <div class="campo">
                <label for="email">Tu correo <span class="opcional">(opcional, solo si querés que te escriban)</span></label>
                <input id="email" name="email" type="email" />
              </div>
              <button class="boton" type="submit">Enviar</button>
            </form>
          </>
        )}
      </section>
    </Pagina>
  );
}

export function Reportar({ c, listo }: { c: Charla; listo?: boolean }) {
  return (
    <Pagina titulo="Reportar un problema" miga="reportar" sinReglas>
      <section class="seccion">
        {listo ? (
          <>
            <h1>Recibido.</h1>
            <p class="intro">Lo revisamos. Si dejaste tu correo, te contamos qué hicimos. Gracias por cuidar la casa.</p>
          </>
        ) : (
          <>
            <h1>Reportar la charla «{c.tema}»</h1>
            <p class="intro">Si algo rompió los acuerdos de la casa, contanos. Lo lee una persona, no un sistema.</p>
            <form class="formulario" method="post" action={`/reportar/${c.slug}`}>
              <fieldset>
                <legend>Qué pasó</legend>
                {[
                  ["venta", "Era una venta encubierta o me presionaron para pagar algo."],
                  ["datos", "Me pidieron contraseñas, claves o datos sensibles."],
                  ["trato", "Hubo un trato irrespetuoso o acoso."],
                  ["falso", "La persona no es quien dice ser o infla lo que sabe."],
                  ["ausente", "Reservé y no apareció, o la agenda no tiene horarios."],
                  ["otro", "Otra cosa."],
                ].map(([v, t]) => <label class="radio"><input type="radio" name="motivo" value={v} required /> {t}</label>)}
              </fieldset>
              <div class="campo">
                <label for="detalle">Contanos más <span class="opcional">(opcional)</span></label>
                <textarea id="detalle" name="detalle" maxlength={1500}></textarea>
              </div>
              <div class="campo">
                <label for="email">Tu correo <span class="opcional">(opcional)</span></label>
                <input id="email" name="email" type="email" />
              </div>
              <button class="boton" type="submit">Enviar el reporte</button>
            </form>
          </>
        )}
      </section>
    </Pagina>
  );
}

export function NoEncontrada() {
  return (
    <Pagina titulo="No está" sinReglas>
      <section class="seccion">
        <h1>Esa puerta no existe.</h1>
        <p class="intro">Puede que la charla se haya retirado o que el enlace esté mal. <a href="/#charlas">Mirá las que están abiertas.</a></p>
      </section>
    </Pagina>
  );
}
