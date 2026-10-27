import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "./data/charla-libre.db";
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS charlas (
  id            INTEGER PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  token         TEXT UNIQUE NOT NULL,          -- clave del panel del anfitrión
  nombre        TEXT NOT NULL,
  email         TEXT NOT NULL,
  perfil_url    TEXT,                          -- un lugar público donde la persona existe
  desde         TEXT NOT NULL,                 -- desde dónde habla ("Emprendedor", "Emigré en 2019")
  tema          TEXT NOT NULL,                 -- título corto
  invitacion    TEXT NOT NULL,                 -- el texto de la invitación
  presentacion  TEXT NOT NULL,                 -- quién soy, por qué abro esto
  puntos        TEXT NOT NULL DEFAULT '',      -- "podemos empezar por acá", una línea por punto
  duracion      INTEGER NOT NULL DEFAULT 30,   -- minutos
  agenda_url    TEXT NOT NULL,                 -- Cal.com / Calendly
  despues       TEXT,                          -- qué hay después, si hay (opcional, visible)
  despues_url   TEXT,
  estado        TEXT NOT NULL DEFAULT 'abierta', -- abierta | pausada | retirada
  confirmada_en TEXT NOT NULL DEFAULT (datetime('now')), -- última vez que dijo "sigo abierto"
  creada_en     TEXT NOT NULL DEFAULT (datetime('now')),
  editada_en    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clics (
  id         INTEGER PRIMARY KEY,
  charla_id  INTEGER NOT NULL REFERENCES charlas(id),
  origen     TEXT,                              -- ?de=ig / wa / catalogo
  creado_en  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservas (
  id          INTEGER PRIMARY KEY,
  charla_id   INTEGER NOT NULL REFERENCES charlas(id),
  externo_id  TEXT,                             -- uid de Cal.com
  estado      TEXT NOT NULL,                    -- creada | cancelada | terminada
  inicio      TEXT,
  creada_en   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(charla_id, externo_id)
);

CREATE TABLE IF NOT EXISTS respuestas (
  id         INTEGER PRIMARY KEY,
  charla_id  INTEGER NOT NULL REFERENCES charlas(id),
  quien      TEXT NOT NULL,                     -- visitante | anfitrion
  valio      INTEGER,                           -- 1 sí / 0 no / NULL sin responder
  comentario TEXT,
  de_que     TEXT,                              -- "¿y vos de qué podrías hablar?"
  email      TEXT,
  creada_en  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reportes (
  id         INTEGER PRIMARY KEY,
  charla_id  INTEGER NOT NULL REFERENCES charlas(id),
  motivo     TEXT NOT NULL,
  detalle    TEXT,
  email      TEXT,
  resuelto   INTEGER NOT NULL DEFAULT 0,
  creado_en  TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export type Charla = {
  id: number; slug: string; token: string; nombre: string; email: string;
  perfil_url: string | null; desde: string; tema: string; invitacion: string;
  presentacion: string; puntos: string; duracion: number; agenda_url: string;
  despues: string | null; despues_url: string | null;
  estado: "abierta" | "pausada" | "retirada";
  confirmada_en: string; creada_en: string; editada_en: string;
};

export function nuevoToken() {
  return randomBytes(16).toString("hex");
}

export function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "charla";
}

export function slugLibre(base: string) {
  let slug = slugify(base), n = 2;
  while (db.prepare("SELECT 1 FROM charlas WHERE slug = ?").get(slug)) slug = `${slugify(base)}-${n++}`;
  return slug;
}

export const q = {
  charlaPorSlug: (slug: string) => db.prepare("SELECT * FROM charlas WHERE slug = ?").get(slug) as Charla | undefined,
  charlaPorToken: (token: string) => db.prepare("SELECT * FROM charlas WHERE token = ?").get(token) as Charla | undefined,
  catalogo: () => db.prepare("SELECT * FROM charlas WHERE estado IN ('abierta','pausada') ORDER BY estado = 'abierta' DESC, confirmada_en DESC").all() as Charla[],
  stats: (id: number) => ({
    clics: (db.prepare("SELECT COUNT(*) n FROM clics WHERE charla_id = ?").get(id) as any).n as number,
    clics30: (db.prepare("SELECT COUNT(*) n FROM clics WHERE charla_id = ? AND creado_en > datetime('now','-30 days')").get(id) as any).n as number,
    reservas: (db.prepare("SELECT COUNT(*) n FROM reservas WHERE charla_id = ? AND estado != 'cancelada'").get(id) as any).n as number,
    terminadas: (db.prepare("SELECT COUNT(*) n FROM reservas WHERE charla_id = ? AND estado = 'terminada'").get(id) as any).n as number,
    canceladas: (db.prepare("SELECT COUNT(*) n FROM reservas WHERE charla_id = ? AND estado = 'cancelada'").get(id) as any).n as number,
    valio: (db.prepare("SELECT COUNT(*) n FROM respuestas WHERE charla_id = ? AND quien='visitante' AND valio = 1").get(id) as any).n as number,
    respuestas: (db.prepare("SELECT COUNT(*) n FROM respuestas WHERE charla_id = ? AND quien='visitante' AND valio IS NOT NULL").get(id) as any).n as number,
    manos: db.prepare("SELECT de_que, email, creada_en FROM respuestas WHERE charla_id = ? AND de_que IS NOT NULL AND de_que != '' ORDER BY creada_en DESC").all(id) as { de_que: string; email: string | null; creada_en: string }[],
    comentarios: db.prepare("SELECT comentario, valio, creada_en FROM respuestas WHERE charla_id = ? AND comentario IS NOT NULL AND comentario != '' ORDER BY creada_en DESC LIMIT 20").all(id) as { comentario: string; valio: number | null; creada_en: string }[],
  }),
};

// ---- Primera charla: la de Kevin. Solo si la base está vacía.
const vacia = (db.prepare("SELECT COUNT(*) n FROM charlas").get() as any).n === 0;
if (vacia) {
  db.prepare(`INSERT INTO charlas (slug, token, nombre, email, perfil_url, desde, tema, invitacion, presentacion, puntos, duracion, agenda_url, despues, despues_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "kevin",
    process.env.KEVIN_TOKEN ?? nuevoToken(),
    "Kevin Levy",
    process.env.KEVIN_EMAIL ?? "hola@charlalibre.com",
    process.env.KEVIN_PERFIL ?? null,
    "Emprendedor. Hace años que vivo, trabajo y aprendo con Bitcoin.",
    "Dinero y Bitcoin",
    "Hablemos de dinero. Y de Bitcoin. De lo que te preocupa, de lo que no entendés, de eso que no sabés con quién hablar.",
    "Decidí abrir un rato de mi semana para conversar con personas que tienen algo dándoles vueltas sobre dinero o Bitcoin. No es asesoramiento ni una clase: es una charla. Podés venir con curiosidad, con miedo, con dudas o con una idea a medio armar. No hace falta tener Bitcoin ni saber por dónde empezar.",
    [
      "Me interesa Bitcoin, pero no sé por dónde empezar.",
      "Me preocupa equivocarme con mi plata.",
      "Ya tengo Bitcoin y quiero entender mejor cómo cuidarlo.",
      "Quiero hablar de esto con alguien que me escuche.",
    ].join("\n"),
    30,
    process.env.KEVIN_AGENDA ?? "https://cal.com/kevin-levy/charla-libre",
    "Si después de la charla querés seguir, doy un acompañamiento práctico, de a uno, para armar y cuidar tu primer Bitcoin. Es aparte, es pago y nunca es una condición para charlar.",
    process.env.KEVIN_DESPUES ?? null,
  );
}
