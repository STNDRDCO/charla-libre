"use client";
import { useActionState } from "react";
import type { Datos } from "@/lib/validar";

export type Estado = { d: Datos; errores: string[]; mensaje?: string };
export type Accion = (prev: Estado, f: FormData) => Promise<Estado>;

export function Formulario({ accion, inicial, editar = false, token }: { accion: Accion; inicial: Datos; editar?: boolean; token?: string }) {
  const [s, enviar, pendiente] = useActionState<Estado, FormData>(accion, { d: inicial, errores: [] });
  const d = s.d;
  return (
    <form className="formulario" action={enviar}>
      {token && <input type="hidden" name="token" value={token} />}
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
      {s.mensaje && <div className="aviso"><p>{s.mensaje}</p></div>}
      {s.errores.length > 0 && (
        <div className="aviso error">
          <p>Falta algo antes de {editar ? "guardar" : "publicar"}:</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{s.errores.map(e => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="campo">
        <label htmlFor="nombre">Tu nombre, como querés que lo vean</label>
        <input id="nombre" name="nombre" type="text" required maxLength={60} defaultValue={d.nombre ?? ""} />
      </div>

      <div className="campo">
        <label htmlFor="desde">Desde dónde hablás</label>
        <span className="ayuda">Una línea. «Emigré a Madrid en 2019», «cerré mi primer negocio», «soy pediatra y me gusta explicar», «me interesa el tema, nada más». Todas valen; lo que importa es que sea cierto.</span>
        <input id="desde" name="desde" type="text" required maxLength={120} defaultValue={d.desde ?? ""} />
      </div>

      <div className="campo">
        <label htmlFor="tema">El tema, en pocas palabras</label>
        <span className="ayuda">Es la puerta, no el temario. «Cambiar de carrera después de los 40», «Criar sin pareja», «Café de especialidad».</span>
        <input id="tema" name="tema" type="text" required maxLength={60} defaultValue={d.tema ?? ""} />
      </div>

      <div className="campo">
        <label htmlFor="invitacion">La invitación</label>
        <span className="ayuda">Una o dos frases, como si se lo dijeras a alguien en persona. Es lo primero que va a leer.</span>
        <textarea id="invitacion" name="invitacion" required maxLength={300} style={{ minHeight: "4.5rem" }} defaultValue={d.invitacion ?? ""} />
      </div>

      <div className="campo">
        <label htmlFor="presentacion">Quién sos y por qué abrís esto</label>
        <span className="ayuda">Un párrafo o dos. Qué viviste, qué sabés, qué no sabés, por qué te dan ganas de conversar sobre esto.</span>
        <textarea id="presentacion" name="presentacion" required maxLength={1500} defaultValue={d.presentacion ?? ""} />
      </div>

      <div className="campo">
        <label htmlFor="puntos">Podemos empezar por acá <span className="opcional">(opcional)</span></label>
        <span className="ayuda">Tres o cuatro frases que alguien podría decir al empezar, una por línea. Ayudan a que la persona se reconozca.</span>
        <textarea id="puntos" name="puntos" maxLength={600} defaultValue={d.puntos ?? ""} />
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="duracion">Cuánto dura</label>
          <select id="duracion" name="duracion" defaultValue={d.duracion ?? "30"}>
            {[20, 30, 45, 60].map(n => <option key={n} value={String(n)}>{n} minutos</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="agenda_url">Tu enlace de agenda</label>
          <span className="ayuda">De Cal.com o Calendly, con el evento de esta charla ya armado y gratis.</span>
          <input id="agenda_url" name="agenda_url" type="url" required placeholder="https://cal.com/tu-nombre/charla" defaultValue={d.agenda_url ?? ""} />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="despues">Qué hay después <span className="opcional">(opcional, pero si existe tiene que estar acá)</span></label>
        <span className="ayuda">Si después de la charla ofrecés algo pago (un curso, una consulta, un acompañamiento), decilo acá con claridad. Se muestra antes de reservar. Si no hay nada, dejalo vacío y la página dirá «Nada».</span>
        <textarea id="despues" name="despues" maxLength={400} style={{ minHeight: "4.5rem" }} defaultValue={d.despues ?? ""} />
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="despues_url">Enlace de eso <span className="opcional">(opcional)</span></label>
          <input id="despues_url" name="despues_url" type="url" defaultValue={d.despues_url ?? ""} />
        </div>
        <div className="campo">
          <label htmlFor="perfil_url">Un lugar donde existís <span className="opcional">(opcional)</span></label>
          <span className="ayuda">LinkedIn, Instagram, tu web. Para que quien reserve sepa que sos una persona real.</span>
          <input id="perfil_url" name="perfil_url" type="url" defaultValue={d.perfil_url ?? ""} />
        </div>
      </div>

      {!editar && (
        <>
          <div className="campo">
            <label htmlFor="email">Tu correo</label>
            <span className="ayuda">No se publica. Es para avisarte cuando haya una reserva o una respuesta, y para preguntarte cada tanto si seguís abierto.</span>
            <input id="email" name="email" type="email" required defaultValue={d.email ?? ""} />
          </div>
          <div className="aviso">
            <p>Al publicar aceptás los acuerdos de la casa (están al pie de todas las páginas). No hay revisión previa: tu charla aparece al instante y la podés editar, pausar o retirar cuando quieras.</p>
          </div>
        </>
      )}

      <button className="boton" type="submit" disabled={pendiente}>{pendiente ? "Un momento…" : editar ? "Guardar cambios" : "Publicar mi charla"}</button>
    </form>
  );
}
