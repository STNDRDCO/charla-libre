import postgres from "postgres";
import { randomBytes } from "node:crypto";

// Una sola conexión perezosa. DATABASE_URL es la cadena "Transaction pooler"
// del panel de Supabase (Connect → ORMs/Drivers), que funciona desde Vercel.
const url = process.env.DATABASE_URL?.trim();
if (!url) throw new Error("Falta DATABASE_URL (cadena de conexión de Supabase, modo Transaction pooler).");

declare global { var __cl_sql: ReturnType<typeof postgres> | undefined; }
export const sql = globalThis.__cl_sql ?? postgres(url, { prepare: false, max: 3, idle_timeout: 20 });
if (process.env.NODE_ENV !== "production") globalThis.__cl_sql = sql;

export type Charla = {
  id: number; slug: string; token: string; nombre: string; email: string;
  perfil_url: string | null; desde: string; tema: string; invitacion: string;
  presentacion: string; puntos: string; duracion: number; agenda_url: string;
  despues: string | null; despues_url: string | null;
  estado: "abierta" | "pausada" | "retirada";
  confirmada_en: Date; creada_en: Date; editada_en: Date;
};

export const nuevoToken = () => randomBytes(16).toString("hex");

export function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "charla";
}

export async function slugLibre(base: string) {
  const raiz = slugify(base);
  const usados = new Set((await sql<{ slug: string }[]>`select slug from cl_charlas where slug like ${raiz + "%"}`).map(r => r.slug));
  if (!usados.has(raiz)) return raiz;
  let n = 2; while (usados.has(`${raiz}-${n}`)) n++;
  return `${raiz}-${n}`;
}

export const charlaPorSlug = async (slug: string) => (await sql<Charla[]>`select * from cl_charlas where slug = ${slug}`)[0];
export const charlaPorToken = async (token: string) => (await sql<Charla[]>`select * from cl_charlas where token = ${token}`)[0];
export const catalogo = () => sql<Charla[]>`select * from cl_charlas where estado in ('abierta','pausada') order by (estado = 'abierta') desc, confirmada_en desc`;

export type Stats = {
  clics: number; clics30: number; reservas: number; terminadas: number; canceladas: number; valio: number; respuestas: number;
  manos: { de_que: string; email: string | null; creada_en: Date }[];
  comentarios: { comentario: string; valio: boolean | null; creada_en: Date }[];
};

export async function stats(id: number): Promise<Stats> {
  const [c] = await sql<{ clics: number; clics30: number }[]>`
    select count(*)::int clics, count(*) filter (where creado_en > now() - interval '30 days')::int clics30 from cl_clics where charla_id = ${id}`;
  const [r] = await sql<{ reservas: number; terminadas: number; canceladas: number }[]>`
    select count(*) filter (where estado <> 'cancelada')::int reservas, count(*) filter (where estado = 'terminada')::int terminadas,
           count(*) filter (where estado = 'cancelada')::int canceladas from cl_reservas where charla_id = ${id}`;
  const [v] = await sql<{ valio: number; respuestas: number }[]>`
    select count(*) filter (where valio)::int valio, count(*) filter (where valio is not null)::int respuestas from cl_respuestas where charla_id = ${id} and quien = 'visitante'`;
  const manos = await sql<Stats["manos"]>`select de_que, email, creada_en from cl_respuestas where charla_id = ${id} and coalesce(de_que,'') <> '' order by creada_en desc`;
  const comentarios = await sql<Stats["comentarios"]>`select comentario, valio, creada_en from cl_respuestas where charla_id = ${id} and coalesce(comentario,'') <> '' order by creada_en desc limit 20`;
  return { ...c, ...r, ...v, manos, comentarios };
}

export const fecha = (d: Date) => d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
export const hace = (d: Date) => {
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  if (dias < 60) return "hace un mes";
  return `hace ${Math.floor(dias / 30)} meses`;
};
export const diasDesde = (d: Date) => Math.floor((Date.now() - d.getTime()) / 86400000);
