// Mismo proveedor y mismas variables que Cartel: RESEND_API_KEY + RESEND_FROM.
// Sin ellas, el mensaje se imprime en la consola y la app sigue.
export async function enviar(a: string, asunto: string, texto: string) {
  const key = process.env.RESEND_API_KEY?.trim(), from = process.env.RESEND_FROM?.trim();
  if (!key || !from) { console.log(`\n[correo no configurado] Para: ${a}\nAsunto: ${asunto}\n${texto}\n`); return; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [a], subject: asunto, text: texto }),
    });
    if (!r.ok) console.error("No se pudo mandar el correo:", r.status, await r.text());
  } catch (e) { console.error("No se pudo mandar el correo:", e); }
}

export const avisarAdmin = (asunto: string, texto: string) => {
  const a = process.env.ADMIN_EMAIL?.trim();
  return a ? enviar(a, asunto, texto) : Promise.resolve();
};

export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
