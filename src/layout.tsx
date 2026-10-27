import type { Child } from "hono/jsx";

export const SITIO = process.env.SITIO_NOMBRE ?? "Charla Libre";
export const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function Pagina(props: { titulo?: string; descripcion?: string; miga?: Child; children: Child; sinReglas?: boolean }) {
  const titulo = props.titulo ? `${props.titulo} — ${SITIO}` : SITIO;
  return (
    <html lang="es-AR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{titulo}</title>
        {props.descripcion && <meta name="description" content={props.descripcion} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/estilo.css" />
        <link rel="icon" href="/puerta.svg" type="image/svg+xml" />
      </head>
      <body>
        <div class="marco">
          <header class="cabecera">
            <a class="marca" href="/"><b>charla libre</b>{props.miga && <span> / {props.miga}</span>}</a>
            <nav>
              <a href="/#charlas">Charlas</a>
              <a href="/abrir">Abrir una charla</a>
            </nav>
          </header>
          <main>{props.children}</main>
          {!props.sinReglas && <Pie />}
        </div>
      </body>
    </html>
  );
}

export function ReglasDeLaCasa() {
  return (
    <div class="casa">
      <div>
        <h3>Qué es una charla libre</h3>
        <p>Alguien abre un rato de su tiempo para conversar con vos sobre un tema. Es gratis, es por videollamada y no hay temario: el tema es la puerta, no el recorrido. Lo que haya después de la charla, si hay algo, está escrito antes de que reserves.</p>
        <p>Nadie acá es tu terapeuta, tu abogado ni tu asesor financiero, aunque lo sea en su vida. Si estás pasando un momento difícil, podés hablar con alguien ahora mismo: en Argentina, la línea 135 (Centro de Asistencia al Suicida); en otros países, el servicio de emergencias local.</p>
      </div>
      <div>
        <h3>Acuerdos de la casa</h3>
        <ul>
          <li>Tratamos al otro con respeto. Sin acoso, sin insistencia después de un no.</li>
          <li>Cada uno habla desde quien es. Nadie se hace pasar por otra persona ni infla lo que sabe.</li>
          <li>Nadie pide contraseñas, claves, frases de recuperación ni datos sensibles. Nunca.</li>
          <li>Lo gratis es gratis. Si hay algo pago después, se dice antes y no es condición.</li>
          <li>Lo que se conversa queda entre los dos, salvo que se acuerde otra cosa.</li>
        </ul>
        <p><small>Si algo de esto no se cumple, cada charla tiene un enlace para reportarlo. Las publicaciones que rompen estos acuerdos se retiran.</small></p>
      </div>
    </div>
  );
}

function Pie() {
  return (
    <footer class="pie">
      <ReglasDeLaCasa />
      <small class="meta">{SITIO}. Encontrá con quién hablar, o sé esa persona para alguien.</small>
    </footer>
  );
}

export function Cabecera(props: { children: Child }) { return props.children; }

export const fecha = (iso: string) => {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
};
export const hace = (iso: string) => {
  const dias = Math.floor((Date.now() - new Date(iso.replace(" ", "T") + "Z").getTime()) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  if (dias < 60) return "hace un mes";
  return `hace ${Math.floor(dias / 30)} meses`;
};
