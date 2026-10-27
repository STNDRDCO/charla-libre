# Charla Libre

Un formato, no un marketplace: una persona abre un rato de su tiempo para conversar sobre un tema, gratis, por videollamada. Cada charla tiene su página, se comparte sola, y la casa pone las reglas, mide lo que pasa y junta a los próximos anfitriones.

## Qué hay

| Ruta | Qué hace |
|---|---|
| `/` | Portada y lista de puertas abiertas. |
| `/c/:slug` | La página de una charla: invitación, quién es, cuánto dura, qué hay después, botón a la agenda. |
| `/ir/:slug?de=origen` | El enlace medido. Cuenta el clic (con origen) y manda a la agenda. |
| `/abrir` | Publicar una charla. Sin aprobación previa. |
| `/panel/:clave` | Panel del anfitrión: cifras, manos levantadas, editar, pausar, reabrir, retirar, «sigo abierto». |
| `/gracias/:slug` | Dos preguntas después de la charla: ¿valió la pena? y ¿vos de qué podrías hablar? |
| `/reportar/:slug` | Reportar un problema. Llega al correo del admin. |
| `/admin/:ADMIN_TOKEN` | Reportes y retiro de charlas. |
| `POST /api/agenda/calcom/:slug` | Webhook de Cal.com (firmado con la clave del panel). Reservas creadas, canceladas y terminadas. |
| `POST /api/agenda/calendly/:slug?clave=` | Webhook de Calendly (planes pagos). |

Las reglas de la casa aparecen al pie de todas las páginas públicas. El campo «qué hay después» es visible antes de reservar; si está vacío, la página dice «Nada».

## Correr

Necesita Node 22.5 o más nuevo (usa `node:sqlite`, sin dependencias nativas).

```
npm install
cp .env.example .env   # completá lo que uses
npm run dev            # http://localhost:3000
```

La primera vez crea `data/charla-libre.db` con la charla de Kevin adentro. La clave de su panel se imprime si la fijás en `KEVIN_TOKEN`; si no, buscala en `/admin/…` (la lista de charlas enlaza a cada panel).

## Publicar en internet

Es un solo proceso Node con un archivo SQLite al lado. Cualquier servicio que tenga disco persistente sirve: Railway, Fly.io, Render, un VPS. En Vercel y similares (sin disco) no, salvo que cambies `DB_PATH` por una base externa.

1. Variables de entorno: las de `.env.example`. `BASE_URL` es obligatoria (se usa en correos y en las instrucciones del webhook).
2. Comando de inicio: `npm start`.
3. Volumen persistente montado donde apunte `DB_PATH`.

## Conectar la agenda

Cada anfitrión usa su propia agenda. Para que el panel sepa qué reservas se hicieron y cuáles sucedieron, la agenda tiene que avisar. Las instrucciones exactas (URL y clave) están en el panel de cada charla. Resumen:

- **Cal.com** (recomendado, gratis): Settings → Developer → Webhooks → URL `BASE_URL/api/agenda/calcom/:slug`, secret = clave del panel, eventos *Booking created*, *Booking cancelled*, *Meeting ended*.
- **Calendly**: solo con plan pago. URL `BASE_URL/api/agenda/calendly/:slug?clave=…`, eventos `invitee.created` e `invitee.canceled`.

Sin webhook, el panel cuenta clics y respuestas pero no reservas.

En el correo de confirmación del evento conviene poner el enlace `BASE_URL/gracias/:slug`: es la única forma de que la persona responda si valió la pena y levante la mano para abrir su propia charla.

## Estructura

```
src/server.tsx     rutas
src/db.ts          esquema SQLite, consultas, primera charla
src/mail.ts        correo saliente (Resend) o consola
src/layout.tsx     plantilla, reglas de la casa
src/pages/         portada, charla, abrir, panel, gracias, reportar
public/estilo.css  una sola hoja de estilos
```

Hono + JSX en el servidor, sin JavaScript en el navegador. Todo son formularios y enlaces.

## Lo que falta a propósito

Búsqueda, categorías, cuentas con contraseña, calendario propio, video propio, pagos. Nada de eso hace falta hasta saber si los anfitriones vuelven a abrir horarios a los tres meses. Esa es la única métrica que importa en esta etapa, y el panel la hace visible.
