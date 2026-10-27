import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sql, charlaPorSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAPA: Record<string, "creada" | "cancelada" | "terminada"> = { BOOKING_CREATED: "creada", BOOKING_CANCELLED: "cancelada", MEETING_ENDED: "terminada" };

// Cal.com firma el cuerpo con HMAC-SHA256 usando el secret del webhook (acá, la clave del panel).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const c = await charlaPorSlug((await params).slug);
  if (!c) return NextResponse.json({ ok: false }, { status: 404 });
  const crudo = await req.text();
  const firma = req.headers.get("x-cal-signature-256") ?? "";
  const esperada = createHmac("sha256", c.token).update(crudo).digest("hex");
  if (firma.length !== esperada.length || !timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return NextResponse.json({ ok: false, motivo: "firma" }, { status: 401 });
  const ev = JSON.parse(crudo) as { triggerEvent?: string; payload?: { uid?: string; startTime?: string } };
  const estado = MAPA[ev.triggerEvent ?? ""];
  if (!estado) return NextResponse.json({ ok: true, ignorado: ev.triggerEvent });
  await sql`insert into cl_reservas (charla_id, externo_id, estado, inicio) values (${c.id}, ${ev.payload?.uid ?? null}, ${estado}, ${ev.payload?.startTime ?? null})
    on conflict (charla_id, externo_id) do update set estado = excluded.estado, inicio = coalesce(excluded.inicio, cl_reservas.inicio)`;
  return NextResponse.json({ ok: true });
}
