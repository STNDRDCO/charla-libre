import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco } from "@/components/Marco";
import { charlaPorToken } from "@/lib/db";
import { BASE_URL } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tu charla está publicada", robots: { index: false } };

export default async function Publicada({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const { clave } = await searchParams;
  const c = clave ? await charlaPorToken(clave) : undefined;
  if (!c) notFound();
  return (
    <Marco miga="publicada" sinReglas>
      <section className="seccion">
        <h1>Listo. Tu puerta está abierta.</h1>
        <p className="intro">Tu charla ya aparece en la lista y tiene su propia página. Es la que vas a compartir.</p>
        <span className="codigo">{BASE_URL}/c/{c.slug}</span>
        <div className="clave">
          <p><b>Guardá este enlace.</b> Es tu panel: desde ahí editás, pausás o retirás la charla y ves cómo va. Cualquiera que lo tenga puede hacer lo mismo, así que no lo publiques. También te lo mandamos por correo.</p>
          <span className="codigo">{BASE_URL}/panel/{c.token}</span>
        </div>
        <div className="acciones">
          <Link className="boton" href={`/c/${c.slug}`}>Ver mi página</Link>
          <Link className="boton secundario" href={`/panel/${c.token}`}>Ir a mi panel</Link>
        </div>
      </section>
    </Marco>
  );
}
