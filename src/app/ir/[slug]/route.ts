import { NextRequest, NextResponse } from "next/server";
import { sql, charlaPorSlug } from "@/lib/db";
import { texto } from "@/lib/validar";
import { BASE_URL } from "@/lib/mail";

export const dynamic = "force-dynamic";

// El enlace medido: cuenta el clic (con origen) y manda a la agenda.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const c = await charlaPorSlug((await params).slug);
  if (!c || c.estado !== "abierta") return NextResponse.redirect(new URL("/", BASE_URL), 302);
  const de = texto(req.nextUrl.searchParams.get("de"), 40);
  const origen = de || (req.headers.get("referer")?.startsWith(BASE_URL) ? "catalogo" : null);
  await sql`insert into cl_clics (charla_id, origen) values (${c.id}, ${origen})`;
  return NextResponse.redirect(c.agenda_url, 302);
}
