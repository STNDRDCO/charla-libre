# Charla Libre

Un formato, no un marketplace: una persona abre un rato de su tiempo para conversar sobre un tema, gratis, por videollamada. Cada charla tiene su página, se comparte sola, y la casa pone las reglas, mide lo que pasa y junta a los próximos anfitriones.

Mismo stack que Cartel: Next.js en Vercel, Postgres en Supabase, Resend para correo. Costo adicional: cero.

## Rutas

| Ruta | Qué hace |
|---|---|
| `/` | Portada y lista de puertas abiertas. |
| `/c/:slug` | La página de una charla: invitación, quién es, cuánto dura, qué hay después, botón a la agenda. |
| `/ir/:slug?de=origen` | El enlace medido. Cuenta el clic (con origen) y manda a la agenda. |
| `/abrir` | Publicar una charla. Sin aprobación previa. |
| `/panel/:clave` | Panel del anfitrión: cifras, manos levantadas, editar, pausar, reabrir, retirar, «sigo abierto». |
| `/gracias/:slug` | Dos preguntas después de la charla: ¿valió la pena? y ¿vos de qué podrías hablar? |
| `/reportar/:slug` | Reportar un problema. Llega a `ADMIN_EMAIL`. |
| `/admin/:ADMIN_TOKEN` | Reportes y retiro de charlas. |
| `POST /api/agenda/calcom/:slug` | Webhook de Cal.com, firmado con la clave del panel. |
| `POST /api/agenda/calendly/:slug?clave=` | Webhook de Calendly (planes pagos). |

## Ponerlo en línea (una vez, quince minutos)

1. **Supabase.** Proyecto nuevo gratis (o el de Cartel: las tablas llevan prefijo `cl_` y no chocan). En *SQL Editor* pegá y corré `supabase/migrations/0001_init.sql`. Después abrí `supabase/seed.sql`, reemplazá correo, agenda y perfil, y correlo: es tu charla.
2. **Cadena de conexión.** *Connect* (arriba a la derecha) → *Transaction pooler* → copiá la URL, poné tu contraseña. Es `DATABASE_URL`.
3. **Vercel.** *Add New → Project → Import* `STNDRDCO/charla-libre`. Framework: Next.js, sin cambiar nada. En *Environment Variables* cargá las de `.env.example`. Deploy.
4. **Dominio.** *Settings → Domains → charlalibre.com.ar*. Vercel te da un registro A (`76.76.21.21`) para la raíz y un CNAME para `www`; los cargás donde esté el DNS del dominio. HTTPS sale solo.
5. **Tu panel.** Entrá a `https://charlalibre.com.ar/admin/TU_ADMIN_TOKEN`; ahí está el enlace a tu panel. Desde el panel, seguí las instrucciones para el webhook de Cal.com y agregá `/gracias/kevin` al correo de confirmación de tu evento.

## Local

```
npm install
cp .env.example .env.local   # con una DATABASE_URL (Supabase o Postgres local)
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql -f supabase/seed.sql
npm run dev
```

## Conectar la agenda de un anfitrión

Cada anfitrión usa su propia agenda. Para que el panel sepa qué reservas se hicieron y cuáles sucedieron, la agenda avisa por webhook; las instrucciones con URL y clave están en cada panel. Cal.com es gratis y lo permite; Calendly solo en planes pagos. Sin webhook, el panel cuenta clics y respuestas pero no reservas.

## Estructura

```
src/app/            rutas (App Router), acciones de servidor al lado de cada página
src/components/     Marco (cabecera, reglas de la casa), Formulario
src/lib/db.ts       conexión Postgres, consultas, tipos
src/lib/mail.ts     Resend o consola
src/lib/validar.ts  validación del formulario
src/app/globals.css una sola hoja de estilos
supabase/           migración y seed
```

Sin JavaScript de cliente salvo el formulario de publicar/editar (para mostrar errores sin perder lo escrito) y la confirmación de retirar.

## Lo que falta a propósito

Búsqueda, categorías, cuentas con contraseña, calendario propio, video propio, pagos. Nada de eso hace falta hasta saber si los anfitriones vuelven a abrir horarios a los tres meses. Esa es la única métrica que importa, y el panel la hace visible.
