-- Charla Libre. Tablas con prefijo cl_ para poder convivir con otro proyecto.
create table if not exists cl_charlas (
  id            bigint generated always as identity primary key,
  slug          text unique not null,
  token         text unique not null,
  nombre        text not null,
  email         text not null,
  perfil_url    text,
  "desde"       text not null,
  tema          text not null,
  invitacion    text not null,
  presentacion  text not null,
  puntos        text not null default '',
  duracion      int  not null default 30,
  agenda_url    text not null,
  despues       text,
  despues_url   text,
  estado        text not null default 'abierta' check (estado in ('abierta','pausada','retirada')),
  confirmada_en timestamptz not null default now(),
  creada_en     timestamptz not null default now(),
  editada_en    timestamptz not null default now()
);
create index if not exists cl_charlas_estado on cl_charlas (estado, confirmada_en desc);

create table if not exists cl_clics (
  id        bigint generated always as identity primary key,
  charla_id bigint not null references cl_charlas(id) on delete cascade,
  origen    text,
  creado_en timestamptz not null default now()
);
create index if not exists cl_clics_charla on cl_clics (charla_id, creado_en);

create table if not exists cl_reservas (
  id         bigint generated always as identity primary key,
  charla_id  bigint not null references cl_charlas(id) on delete cascade,
  externo_id text,
  estado     text not null check (estado in ('creada','cancelada','terminada')),
  inicio     timestamptz,
  creada_en  timestamptz not null default now(),
  unique (charla_id, externo_id)
);

create table if not exists cl_respuestas (
  id         bigint generated always as identity primary key,
  charla_id  bigint not null references cl_charlas(id) on delete cascade,
  quien      text not null default 'visitante',
  valio      boolean,
  comentario text,
  de_que     text,
  email      text,
  creada_en  timestamptz not null default now()
);

create table if not exists cl_reportes (
  id        bigint generated always as identity primary key,
  charla_id bigint not null references cl_charlas(id) on delete cascade,
  motivo    text not null,
  detalle   text,
  email     text,
  resuelto  boolean not null default false,
  creado_en timestamptz not null default now()
);

-- La app entra con la conexión directa (DATABASE_URL), que no pasa por RLS.
-- Igual se activa RLS sin políticas para que la key pública de Supabase no vea nada.
alter table cl_charlas    enable row level security;
alter table cl_clics      enable row level security;
alter table cl_reservas   enable row level security;
alter table cl_respuestas enable row level security;
alter table cl_reportes   enable row level security;
