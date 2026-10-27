import Link from "next/link";

export function Marco({ miga, children, sinReglas }: { miga?: string; children: React.ReactNode; sinReglas?: boolean }) {
  return (
    <div className="marco">
      <header className="cabecera">
        <Link className="marca" href="/"><b>charla libre</b>{miga && <span> / {miga}</span>}</Link>
        <nav>
          <Link href="/#charlas">Charlas</Link>
          <Link href="/abrir">Abrir una charla</Link>
        </nav>
      </header>
      <main>{children}</main>
      {!sinReglas && (
        <footer className="pie">
          <ReglasDeLaCasa />
          <small className="meta">Charla Libre. Encontrá con quién hablar, o sé esa persona para alguien.</small>
        </footer>
      )}
    </div>
  );
}

export function ReglasDeLaCasa() {
  return (
    <div className="casa">
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
