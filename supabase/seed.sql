-- La primera charla: la de Kevin. Correr una vez, después de la migración,
-- en el SQL Editor de Supabase. Reemplazá el correo, la agenda y el perfil.
-- La clave del panel se genera sola; después la ves en /admin/… o con:
--   select token from cl_charlas where slug = 'kevin';
create extension if not exists pgcrypto;
insert into cl_charlas (slug, token, nombre, email, perfil_url, "desde", tema, invitacion, presentacion, puntos, duracion, agenda_url, despues, despues_url)
values (
  'kevin',
  encode(gen_random_bytes(16), 'hex'),
  'Kevin Levy',
  'TU_CORREO@ejemplo.com',
  'https://www.linkedin.com/in/TU_PERFIL',
  'Emprendedor. Hace años que vivo, trabajo y aprendo con Bitcoin.',
  'Dinero y Bitcoin',
  'Hablemos de dinero. Y de Bitcoin. De lo que te preocupa, de lo que no entendés, de eso que no sabés con quién hablar.',
  E'Decidí abrir un rato de mi semana para conversar con personas que tienen algo dándoles vueltas sobre dinero o Bitcoin. No es asesoramiento ni una clase: es una charla. Podés venir con curiosidad, con miedo, con dudas o con una idea a medio armar. No hace falta tener Bitcoin ni saber por dónde empezar.',
  E'Me interesa Bitcoin, pero no sé por dónde empezar.\nMe preocupa equivocarme con mi plata.\nYa tengo Bitcoin y quiero entender mejor cómo cuidarlo.\nQuiero hablar de esto con alguien que me escuche.',
  30,
  'https://cal.com/TU_USUARIO/charla-libre',
  'Si después de la charla querés seguir, doy un acompañamiento práctico, de a uno, para armar y cuidar tu primer Bitcoin. Es aparte, es pago y nunca es una condición para charlar.',
  null
)
on conflict (slug) do nothing;
