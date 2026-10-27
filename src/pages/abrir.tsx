import { Pagina, BASE_URL } from "../layout";
import type { Charla } from "../db";

export type Datos = Partial<Record<"nombre" | "email" | "perfil_url" | "desde" | "tema" | "invitacion" | "presentacion" | "puntos" | "duracion" | "agenda_url" | "despues" | "despues_url", string>>;

export function Formulario({ d = {}, errores = [], accion, editar = false }: { d?: Datos; errores?: string[]; accion: string; editar?: boolean }) {
  return (
    <form class="formulario" method="post" action={accion}>
      <input type="text" name="web" tabindex={-1} autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" />
      {errores.length > 0 && (
        <div class="aviso error">
          <p>Falta algo antes de publicar:</p>
          <ul style="margin:0;padding-left:1.1rem">{errores.map(e => <li>{e}</li>)}</ul>
        </div>
      )}

      <div class="campo">
        <label for="nombre">Tu nombre, como querés que lo vean</label>
        <input id="nombre" name="nombre" type="text" required maxlength={60} value={d.nombre ?? ""} />
      </div>

      <div class="campo">
        <label for="desde">Desde dónde hablás</label>
        <span class="ayuda">Una línea. «Emigré a Madrid en 2019», «cerré mi primer negocio», «soy pediatra y me gusta explicar», «me interesa el tema, nada más». Todas valen; lo que importa es que sea cierto.</span>
        <input id="desde" name="desde" type="text" required maxlength={120} value={d.desde ?? ""} />
      </div>

      <div class="campo">
        <label for="tema">El tema, en pocas palabras</label>
        <span class="ayuda">Es la puerta, no el temario. «Cambiar de carrera después de los 40», «Criar sin pareja», «Café de especialidad».</span>
        <input id="tema" name="tema" type="text" required maxlength={60} value={d.tema ?? ""} />
      </div>

      <div class="campo">
        <label for="invitacion">La invitación</label>
        <span class="ayuda">Una o dos frases, como si se lo dijeras a alguien en persona. Es lo primero que va a leer.</span>
        <textarea id="invitacion" name="invitacion" required maxlength={300} style="min-height:4.5rem">{d.invitacion ?? ""}</textarea>
      </div>

      <div class="campo">
        <label for="presentacion">Quién sos y por qué abrís esto</label>
        <span class="ayuda">Un párrafo o dos. Qué viviste, qué sabés, qué no sabés, por qué te dan ganas de conversar sobre esto.</span>
        <textarea id="presentacion" name="presentacion" required maxlength={1500}>{d.presentacion ?? ""}</textarea>
      </div>

      <div class="campo">
        <label for="puntos">Podemos empezar por acá <span class="opcional">(opcional)</span></label>
        <span class="ayuda">Tres o cuatro frases que alguien podría decir al empezar, una por línea. Ayudan a que la persona se reconozca.</span>
        <textarea id="puntos" name="puntos" maxlength={600}>{d.puntos ?? ""}</textarea>
      </div>

      <div class="fila">
        <div class="campo">
          <label for="duracion">Cuánto dura</label>
          <select id="duracion" name="duracion">
            {[20, 30, 45, 60].map(n => <option value={String(n)} selected={String(n) === (d.duracion ?? "30")}>{n} minutos</option>)}
          </select>
        </div>
        <div class="campo">
          <label for="agenda_url">Tu enlace de agenda</label>
          <span class="ayuda">De Cal.com o Calendly, con el evento de esta charla ya armado y gratis.</span>
          <input id="agenda_url" name="agenda_url" type="url" required placeholder="https://cal.com/tu-nombre/charla" value={d.agenda_url ?? ""} />
        </div>
      </div>

      <div class="campo">
        <label for="despues">Qué hay después <span class="opcional">(opcional, pero si existe tiene que estar acá)</span></label>
        <span class="ayuda">Si después de la charla ofrecés algo pago (un curso, una consulta, un acompañamiento), decilo acá con claridad. Se muestra antes de reservar. Si no hay nada, dejalo vacío y la página dirá «Nada».</span>
        <textarea id="despues" name="despues" maxlength={400} style="min-height:4.5rem">{d.despues ?? ""}</textarea>
      </div>

      <div class="fila">
        <div class="campo">
          <label for="despues_url">Enlace de eso <span class="opcional">(opcional)</span></label>
          <input id="despues_url" name="despues_url" type="url" value={d.despues_url ?? ""} />
        </div>
        <div class="campo">
          <label for="perfil_url">Un lugar donde existís <span class="opcional">(opcional)</span></label>
          <span class="ayuda">LinkedIn, Instagram, tu web. Para que quien reserve sepa que sos una persona real.</span>
          <input id="perfil_url" name="perfil_url" type="url" value={d.perfil_url ?? ""} />
        </div>
      </div>

      {!editar && (
        <div class="campo">
          <label for="email">Tu correo</label>
          <span class="ayuda">No se publica. Es para avisarte cuando haya una reserva o una respuesta, y para preguntarte cada tanto si seguís abierto.</span>
          <input id="email" name="email" type="email" required value={d.email ?? ""} />
        </div>
      )}

      {!editar && (
        <div class="aviso">
          <p>Al publicar aceptás los acuerdos de la casa (están al pie de todas las páginas). No hay revisión previa: tu charla aparece al instante y la podés editar, pausar o retirar cuando quieras.</p>
        </div>
      )}

      <button class="boton" type="submit">{editar ? "Guardar cambios" : "Publicar mi charla"}</button>
    </form>
  );
}

export function Abrir(props: { d?: Datos; errores?: string[] }) {
  return (
    <Pagina titulo="Abrir una charla" miga="abrir una charla">
      <section class="seccion">
        <h1>Abrí un rato para alguien.</h1>
        <p class="intro">Tenés ganas de conversar sobre algo que viviste, que sabés o que te interesa. Contás desde dónde, pegás tu agenda y listo: tu charla tiene su propia página para compartir donde quieras, y aparece en la lista de puertas abiertas.</p>
        <ol class="pasos">
          <li>Completás esto (cinco minutos).</li>
          <li>Te damos tu página y la clave de tu panel.</li>
          <li>La compartís con tu gente. Las reservas llegan por tu agenda.</li>
        </ol>
        <Formulario d={props.d} errores={props.errores} accion="/abrir" />
      </section>
    </Pagina>
  );
}

export function Publicada({ c }: { c: Charla }) {
  const pagina = `${BASE_URL}/c/${c.slug}`;
  const panel = `${BASE_URL}/panel/${c.token}`;
  return (
    <Pagina titulo="Tu charla está publicada" miga="publicada" sinReglas>
      <section class="seccion">
        <h1>Listo. Tu puerta está abierta.</h1>
        <p class="intro">Tu charla ya aparece en la lista y tiene su propia página. Es la que vas a compartir.</p>
        <span class="codigo">{pagina}</span>
        <div class="clave">
          <p><b>Guardá este enlace.</b> Es tu panel: desde ahí editás, pausás o retirás la charla y ves cómo va. Cualquiera que lo tenga puede hacer lo mismo, así que no lo publiques. También te lo mandamos por correo.</p>
          <span class="codigo">{panel}</span>
        </div>
        <div class="acciones">
          <a class="boton" href={`/c/${c.slug}`}>Ver mi página</a>
          <a class="boton secundario" href={`/panel/${c.token}`}>Ir a mi panel</a>
        </div>
      </section>
    </Pagina>
  );
}
