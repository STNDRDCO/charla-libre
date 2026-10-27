"use server";
import { redirect } from "next/navigation";
import { sql, charlaPorSlug } from "@/lib/db";
import { texto } from "@/lib/validar";
import { enviar, BASE_URL } from "@/lib/mail";

export async function responder(f: FormData) {
  const slug = texto(f.get("slug"), 60);
  const c = await charlaPorSlug(slug);
  if (!c) redirect("/");
  const valio = f.get("valio") === "1" ? true : f.get("valio") === "0" ? false : null;
  const de_que = texto(f.get("de_que"), 160) || null, comentario = texto(f.get("comentario"), 600) || null, email = texto(f.get("email"), 120) || null;
  await sql`insert into cl_respuestas (charla_id, quien, valio, comentario, de_que, email) values (${c.id}, 'visitante', ${valio}, ${comentario}, ${de_que}, ${email})`;
  if (de_que || comentario) await enviar(c.email, "Alguien respondió después de tu charla",
    `${valio === true ? "Dijo que valió la pena." : valio === false ? "Dijo que no le sirvió mucho." : ""}\n${comentario ? `\n«${comentario}»\n` : ""}${de_que ? `\nLevantó la mano: podría hablar de «${de_que}».${email ? ` Su correo: ${email}` : ""}\n` : ""}\nTodo está en tu panel: ${BASE_URL}/panel/${c.token}`);
  redirect(`/gracias/${slug}?listo=1`);
}
