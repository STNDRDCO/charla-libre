"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

function autorizado(f: FormData) {
  const ADMIN = process.env.ADMIN_TOKEN?.trim();
  if (!ADMIN || f.get("token") !== ADMIN) redirect("/");
  return ADMIN;
}

export async function resolver(f: FormData) {
  const admin = autorizado(f);
  await sql`update cl_reportes set resuelto = true where id = ${Number(f.get("id"))}`;
  redirect(`/admin/${admin}`);
}

export async function retirarCharla(f: FormData) {
  const admin = autorizado(f);
  await sql`update cl_charlas set estado = 'retirada', editada_en = now() where id = ${Number(f.get("id"))}`;
  revalidatePath("/");
  redirect(`/admin/${admin}`);
}
