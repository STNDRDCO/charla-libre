"use server";
import { redirect } from "next/navigation";
import { sql, charlaPorSlug } from "@/lib/db";
import { texto } from "@/lib/validar";
import { avisarAdmin, BASE_URL } from "@/lib/mail";

export async function reportar(f: FormData) {
  const slug = texto(f.get("slug"), 60);
  const c = await charlaPorSlug(slug);
  if (!c) redirect("/");
  const motivo = texto(f.get("motivo"), 20) || "otro", detalle = texto(f.get("detalle"), 1500) || null, email = texto(f.get("email"), 120) || null;
  await sql`insert into cl_reportes (charla_id, motivo, detalle, email) values (${c.id}, ${motivo}, ${detalle}, ${email})`;
  await avisarAdmin(`Reporte sobre «${c.tema}» (${motivo})`, `${BASE_URL}/c/${c.slug}\n\n${detalle ?? "(sin detalle)"}\n\nDe: ${email ?? "anónimo"}\nAdministración: ${BASE_URL}/admin/${process.env.ADMIN_TOKEN ?? ""}`);
  redirect(`/reportar/${slug}?listo=1`);
}
