import Link from "next/link";
import { Marco } from "@/components/Marco";

export default function NoEncontrada() {
  return (
    <Marco sinReglas>
      <section className="seccion">
        <h1>Esa puerta no existe.</h1>
        <p className="intro">Puede que la charla se haya retirado o que el enlace esté mal. <Link href="/#charlas">Mirá las que están abiertas.</Link></p>
      </section>
    </Marco>
  );
}
