import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco } from "@/components/Marco";
import { sql, fecha, type Charla } from "@/lib/db";
import { resolver, retirarCharla } from "./acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administración", robots: { index: false } };

export default async function Admin({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ADMIN = process.env.ADMIN_TOKEN?.trim();
  if (!ADMIN || token !== ADMIN) notFound();
  const charlas = await sql<Charla[]>`select * from cl_charlas order by creada_en desc`;
  const reportes = await sql<{ id: number; motivo: string; detalle: string | null; email: string | null; resuelto: boolean; creado_en: Date; tema: string; slug: string }[]>`
    select r.id, r.motivo, r.detalle, r.email, r.resuelto, r.creado_en, c.tema, c.slug from cl_reportes r join cl_charlas c on c.id = r.charla_id order by r.resuelto, r.creado_en desc`;
  return (
    <Marco miga="casa" sinReglas>
      <section className="seccion">
        <h1>La casa, por dentro.</h1>
        <h2>Reportes</h2>
        {reportes.length === 0 ? <p>Ninguno.</p> : (
          <ul className="lista-simple">{reportes.map(r => (
            <li key={r.id}>
              <b>{r.motivo}</b> sobre <Link href={`/c/${r.slug}`}>{r.tema}</Link>{r.resuelto ? " (resuelto)" : ""}
              {r.detalle && <p style={{ margin: ".3rem 0 0" }}>{r.detalle}</p>}
              <small className="meta">{r.email ?? "anónimo"}, {fecha(r.creado_en)}</small>
              {!r.resuelto && <form action={resolver} style={{ marginTop: ".5rem" }}><input type="hidden" name="token" value={ADMIN} /><input type="hidden" name="id" value={r.id} /><button className="boton chico secundario">Marcar resuelto</button></form>}
            </li>
          ))}</ul>
        )}
        <h2>Charlas</h2>
        <ul className="lista-simple">{charlas.map(c => (
          <li key={c.id}>
            <Link href={`/c/${c.slug}`}>{c.tema}</Link>, {c.nombre} ({c.estado})
            <small className="meta">{c.email}. Creada {fecha(c.creada_en)}. Panel: <Link href={`/panel/${c.token}`}>abrir</Link>.</small>
            {c.estado !== "retirada" && <form action={retirarCharla} style={{ marginTop: ".5rem" }}><input type="hidden" name="token" value={ADMIN} /><input type="hidden" name="id" value={c.id} /><button className="boton chico peligro">Retirar</button></form>}
          </li>
        ))}</ul>
      </section>
    </Marco>
  );
}
