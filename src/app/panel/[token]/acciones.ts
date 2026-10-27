"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql, charlaPorToken } from "@/lib/db";
import { leerDatos } from "@/lib/validar";
import type { Estado } from "@/components/Formulario";

async function cambiarEstado(token: string, accion: string) {
  const c = await charlaPorToken(token);
  if (!c) redirect("/");
  let m = "";
  if (accion === "confirmar") { await sql`update cl_charlas set confirmada_en = now() where id = ${c.id}`; m = "Confirmado. En la lista figura que seguís abierto."; }
  if (accion === "pausar") { await sql`update cl_charlas set estado = 'pausada', editada_en = now() where id = ${c.id}`; m = "Charla en pausa. Sigue en la lista, marcada como en pausa, sin botón de reserva."; }
  if (accion === "reabrir") { await sql`update cl_charlas set estado = 'abierta', confirmada_en = now(), editada_en = now() where id = ${c.id}`; m = "Abierta de nuevo."; }
  if (accion === "retirar") { await sql`update cl_charlas set estado = 'retirada', editada_en = now() where id = ${c.id}`; m = "Charla retirada. Ya no aparece. Si querés volver, guardá los cambios en el formulario y se vuelve a publicar."; }
  revalidatePath("/");
  redirect(`/panel/${token}?m=${encodeURIComponent(m)}`);
}

export const confirmar = async (f: FormData) => cambiarEstado(String(f.get("token")), "confirmar");
export const pausar = async (f: FormData) => cambiarEstado(String(f.get("token")), "pausar");
export const reabrir = async (f: FormData) => cambiarEstado(String(f.get("token")), "reabrir");
export const retirar = async (f: FormData) => cambiarEstado(String(f.get("token")), "retirar");

export async function editar(_prev: Estado, f: FormData): Promise<Estado> {
  const token = String(f.get("token") ?? "");
  const c = await charlaPorToken(token);
  if (!c) redirect("/");
  const { d, errores } = leerDatos(f);
  if (errores.length) return { d, errores };
  const estado = c.estado === "retirada" ? "abierta" : c.estado;
  await sql`update cl_charlas set nombre = ${d.nombre!}, perfil_url = ${d.perfil_url || null}, "desde" = ${d.desde!}, tema = ${d.tema!}, invitacion = ${d.invitacion!},
    presentacion = ${d.presentacion!}, puntos = ${d.puntos!}, duracion = ${Number(d.duracion)}, agenda_url = ${d.agenda_url!}, despues = ${d.despues || null},
    despues_url = ${d.despues_url || null}, estado = ${estado}, editada_en = now() where id = ${c.id}`;
  revalidatePath("/"); revalidatePath(`/c/${c.slug}`);
  return { d, errores: [], mensaje: estado !== c.estado ? "Guardado y publicada de nuevo." : "Guardado." };
}
