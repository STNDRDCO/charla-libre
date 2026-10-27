// Correo saliente. Con RESEND_API_KEY manda de verdad (https://resend.com, plan gratuito alcanza);
// sin clave, escribe el mensaje en la consola y sigue. Nada del sitio depende de que el mail llegue.
const KEY = process.env.RESEND_API_KEY;
const DESDE = process.env.MAIL_DESDE ?? "Charla Libre <hola@charlalibre.com>";
const ADMIN = process.env.ADMIN_EMAIL;

export async function enviar(a: string, asunto: string, texto: string) {
  if (!KEY) { console.log(`\n[correo no configurado] Para: ${a}\nAsunto: ${asunto}\n${texto}\n`); return; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: DESDE, to: [a], subject: asunto, text: texto }),
    });
    if (!r.ok) console.error("No se pudo mandar el correo:", r.status, await r.text());
  } catch (e) { console.error("No se pudo mandar el correo:", e); }
}

export const avisarAdmin = (asunto: string, texto: string) => ADMIN ? enviar(ADMIN, asunto, texto) : Promise.resolve();
