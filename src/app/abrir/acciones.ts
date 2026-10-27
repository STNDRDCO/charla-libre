"use server";
import { redirect } from "next/navigation";
import { sql, slugLibre, nuevoToken, charlaPorSlug } from "@/lib/db";
import { leerDatos, emailValido } from "@/lib/validar";
import { enviar, avisarAdmin, BASE_URL } from "@/lib/mail";
import type { Estado } from "@/components/Formulario";

export async function publicar(_prev: Estado, f: FormData): Promise<Estado> {
  if (f.get("web")) return { d: {}, errores: [] }; // bot
  const { d, errores } = leerDatos(f);
  if (!emailValido(d.email!)) errores.push("Un correo al que podamos escribirte.");
  if (errores.length) return { d, errores };

  const slug = await slugLibre(d.nombre!), token = nuevoToken();
  await sql`insert into cl_charlas (slug, token, nombre, email, perfil_url, "desde", tema, invitacion, presentacion, puntos, duracion, agenda_url, despues, despues_url)
    values (${slug}, ${token}, ${d.nombre!}, ${d.email!}, ${d.perfil_url || null}, ${d.desde!}, ${d.tema!}, ${d.invitacion!}, ${d.presentacion!}, ${d.puntos!},
            ${Number(d.duracion)}, ${d.agenda_url!}, ${d.despues || null}, ${d.despues_url || null})`;
  const c = (await charlaPorSlug(slug))!;

  await enviar(c.email, `Tu charla «${c.tema}» está publicada`,
    `Hola ${c.nombre.split(" ")[0]}.\n\nTu charla ya está abierta en ${BASE_URL}/c/${c.slug}\n\nEste es tu panel. Guardalo y no lo compartas: desde acá editás, pausás o retirás la charla.\n${BASE_URL}/panel/${c.token}\n\nGracias por abrir un rato para alguien.\nCharla Libre`);
  await avisarAdmin(`Nueva charla: ${c.tema} (${c.nombre})`, `${BASE_URL}/c/${c.slug}\n\nDesde: ${c.desde}\nAgenda: ${c.agenda_url}\nDespués: ${c.despues ?? "nada"}`);
  redirect(`/abrir/lista?clave=${token}`);
}
