import { NextRequest, NextResponse } from "next/server";
import { sql, charlaPorSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const c = await charlaPorSlug((await params).slug);
  if (!c || req.nextUrl.searchParams.get("clave") !== c.token) return NextResponse.json({ ok: false }, { status: 401 });
  const ev = await req.json() as { event?: string; payload?: { uri?: string; scheduled_event?: { uri?: string; start_time?: string } } };
  const estado = ev.event === "invitee.created" ? "creada" : ev.event === "invitee.canceled" ? "cancelada" : null;
  if (!estado) return NextResponse.json({ ok: true, ignorado: ev.event });
  const externo = ev.payload?.scheduled_event?.uri ?? ev.payload?.uri ?? null;
  await sql`insert into cl_reservas (charla_id, externo_id, estado, inicio) values (${c.id}, ${externo}, ${estado}, ${ev.payload?.scheduled_event?.start_time ?? null})
    on conflict (charla_id, externo_id) do update set estado = excluded.estado, inicio = coalesce(excluded.inicio, cl_reservas.inicio)`;
  return NextResponse.json({ ok: true });
}
