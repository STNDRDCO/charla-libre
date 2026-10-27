import type { Metadata } from "next";
import { Marco } from "@/components/Marco";
import { Formulario } from "@/components/Formulario";
import { publicar } from "./acciones";

export const metadata: Metadata = { title: "Abrir una charla" };

export default function Abrir() {
  return (
    <Marco miga="abrir una charla">
      <section className="seccion">
        <h1>Abrí un rato para alguien.</h1>
        <p className="intro">Tenés ganas de conversar sobre algo que viviste, que sabés o que te interesa. Contás desde dónde, pegás tu agenda y listo: tu charla tiene su propia página para compartir donde quieras, y aparece en la lista de puertas abiertas.</p>
        <ol className="pasos">
          <li>Completás esto (cinco minutos).</li>
          <li>Te damos tu página y la clave de tu panel.</li>
          <li>La compartís con tu gente. Las reservas llegan por tu agenda.</li>
        </ol>
        <Formulario accion={publicar} inicial={{}} />
      </section>
    </Marco>
  );
}
