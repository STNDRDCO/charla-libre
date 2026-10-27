export type Datos = Partial<Record<"nombre" | "email" | "perfil_url" | "desde" | "tema" | "invitacion" | "presentacion" | "puntos" | "duracion" | "agenda_url" | "despues" | "despues_url", string>>;

export const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
export const urlValida = (u: string) => { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch { return false; } };

export function leerDatos(f: FormData): { d: Datos; errores: string[] } {
  const g = (k: string, max: number) => texto(f.get(k), max);
  const d: Datos = {
    nombre: g("nombre", 60), email: g("email", 120).toLowerCase(), perfil_url: g("perfil_url", 300),
    desde: g("desde", 120), tema: g("tema", 60), invitacion: g("invitacion", 300),
    presentacion: g("presentacion", 1500), puntos: g("puntos", 600), duracion: g("duracion", 3),
    agenda_url: g("agenda_url", 300), despues: g("despues", 400), despues_url: g("despues_url", 300),
  };
  const e: string[] = [];
  if (d.nombre!.length < 2) e.push("Tu nombre.");
  if (d.desde!.length < 5) e.push("Desde dónde hablás.");
  if (d.tema!.length < 3) e.push("El tema.");
  if (d.invitacion!.length < 15) e.push("La invitación, aunque sea una frase.");
  if (d.presentacion!.length < 40) e.push("Quién sos y por qué abrís esto, un poco más largo.");
  if (!["20", "30", "45", "60"].includes(d.duracion!)) d.duracion = "30";
  if (!urlValida(d.agenda_url!) || !/cal\.com|calendly\.com|zcal|tidycal|youcanbook|savvycal/i.test(d.agenda_url!)) e.push("Un enlace de agenda que funcione (Cal.com, Calendly u otra agenda con horarios).");
  if (d.perfil_url && !urlValida(d.perfil_url)) e.push("El enlace de tu perfil no parece un enlace.");
  if (d.despues_url && !urlValida(d.despues_url)) e.push("El enlace de «qué hay después» no parece un enlace.");
  if (d.despues_url && !d.despues) e.push("Si ponés un enlace en «qué hay después», contá qué es.");
  return { d, errores: e };
}

export const emailValido = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
