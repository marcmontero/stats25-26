-- Taula de perfils dels entrenadors (equips assignats, càrrec, rol)
-- No conté contrasenyes: aquestes les gestiona Supabase Auth per separat,
-- de manera xifrada i segura.
create table if not exists profiles (
  username text primary key,
  name text not null,
  role text not null,
  position text not null,
  teams jsonb not null,
  created_at timestamptz default now()
);

-- Lectura oberta: les dades del perfil (nom, càrrec, equips) no són
-- sensibles; el que sí és sensible (les contrasenyes) ho gestiona
-- Supabase Auth per separat, mai en aquesta taula.
alter table profiles enable row level security;

drop policy if exists "Lectura oberta de perfils" on profiles;
create policy "Lectura oberta de perfils"
  on profiles for select
  using (true);

-- Inserim els 14 entrenadors
insert into profiles (username, name, role, position, teams) values
  ('uri.entrena', 'Uri Entrena', 'admin', 'Director Tècnic', '"all"'::jsonb),
  ('marc.montero', 'Marc Montero', 'admin', 'Suport tècnic', '"all"'::jsonb),
  ('marc.funtane', 'Marc Funtané', 'coach', 'Entrenador Senior A/B/C Masculí', '["senior-a-masc", "senior-b-masc", "senior-c-masc"]'::jsonb),
  ('leonardo.delvalle', 'Leonardo del Valle', 'coach', 'Entrenador Senior B/C, U25 i U20 Masculí', '["senior-b-masc", "senior-c-masc", "u25-masc", "u20-masc"]'::jsonb),
  ('irene.mancho', 'Irene Mancho', 'coach', 'Entrenadora Senior C, U25 i U20 Masculí', '["senior-c-masc", "u25-masc", "u20-masc"]'::jsonb),
  ('marc.ferrando', 'Marc Ferrando', 'coach', 'Entrenador Júnior, U25, U20, Senior C i Cadet Masculí', '["junior-masc", "u25-masc", "u20-masc", "senior-c-masc", "cadet-masc"]'::jsonb),
  ('alex.medialdea', 'Alex Medialdea', 'coach', 'Entrenador Cadet, Júnior i Preinfantil Masculí', '["cadet-masc", "junior-masc", "preinfantil-masc"]'::jsonb),
  ('andrea.canosa', 'Andrea Canosa', 'coach', 'Entrenadora Preinfantil/Infantil/Mini Masc i Preinfantil/Mini Fem', '["preinfantil-masc", "infantil-masc", "mini-masc", "preinfantil-fem", "mini-negre-fem", "mini-vermell-fem"]'::jsonb),
  ('gerard.espuny', 'Gerard Espuny', 'coach', 'Entrenador Mini, Preinfantil i Premini Negre Masculí', '["mini-masc", "preinfantil-masc", "premini-negre-masc"]'::jsonb),
  ('oriol.calero', 'Oriol Calero', 'coach', 'Entrenador Premini Negre/Vermell i Mini Masculí', '["premini-negre-masc", "mini-masc", "premini-vermell-masc"]'::jsonb),
  ('adria.pons', 'Adrià Pons', 'coach', 'Entrenador Premini Vermell/Negre Masculí', '["premini-vermell-masc", "premini-negre-masc"]'::jsonb),
  ('pau.llucia', 'Pau Llucià', 'coach', 'Entrenador Senior i U25 Femení', '["senior-fem", "u25-fem"]'::jsonb),
  ('robert.fos', 'Robert Fos', 'coach', 'Entrenador Preinfantil i Mini Negre Femení', '["preinfantil-fem", "mini-negre-fem"]'::jsonb),
  ('aina.lopez', 'Aina Lopez', 'coach', 'Entrenadora Mini Negre/Vermell Femení', '["mini-negre-fem", "mini-vermell-fem"]'::jsonb);