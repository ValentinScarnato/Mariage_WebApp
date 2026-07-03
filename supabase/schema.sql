-- Album photo de mariage — schema initial
-- A exécuter une seule fois dans Supabase Dashboard > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

-- ============ TABLES ============

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text not null default 'lieu' check (type in ('table', 'lieu')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  storage_path text not null,
  caption text,
  author_name text,
  created_at timestamptz not null default now()
);

create table if not exists photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists photos_location_id_idx on photos(location_id);
create index if not exists photo_comments_photo_id_idx on photo_comments(photo_id);

-- ============ ROW LEVEL SECURITY ============
-- Lecture publique partout. Ecriture (insert) publique pour les invités.
-- Aucune policy update/delete pour le rôle public : seule la clé service_role
-- (utilisée côté serveur uniquement, dans les routes /admin) peut modifier/supprimer.

alter table locations enable row level security;
alter table photos enable row level security;
alter table photo_comments enable row level security;
alter table guestbook_messages enable row level security;

create policy "public read locations" on locations for select using (true);
create policy "public read photos" on photos for select using (true);
create policy "public read photo_comments" on photo_comments for select using (true);
create policy "public read guestbook_messages" on guestbook_messages for select using (true);

create policy "public insert photos" on photos for insert with check (true);
create policy "public insert photo_comments" on photo_comments for insert with check (true);
create policy "public insert guestbook_messages" on guestbook_messages for insert with check (true);
-- Pas de policy insert sur "locations" : la gestion des lieux se fait uniquement via l'admin (service_role).

-- ============ STORAGE ============

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "public read photos bucket" on storage.objects
  for select using (bucket_id = 'photos');

create policy "public upload photos bucket" on storage.objects
  for insert with check (bucket_id = 'photos');

-- ============ REALTIME (mise à jour live des nouvelles photos / messages) ============

do $$
begin
  alter publication supabase_realtime add table photos;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table guestbook_messages;
exception when duplicate_object then null;
end $$;

-- ============ SEED (lieux de départ, modifiables ensuite dans /admin) ============

insert into locations (slug, name, type, sort_order) values
  ('table-1', 'Table 1', 'table', 1),
  ('table-2', 'Table 2', 'table', 2),
  ('table-3', 'Table 3', 'table', 3),
  ('table-4', 'Table 4', 'table', 4),
  ('table-5', 'Table 5', 'table', 5),
  ('table-6', 'Table 6', 'table', 6),
  ('table-7', 'Table 7', 'table', 7),
  ('table-8', 'Table 8', 'table', 8),
  ('table-9', 'Table 9', 'table', 9),
  ('table-10', 'Table 10', 'table', 10),
  ('bar', 'Bar', 'lieu', 11),
  ('piste-de-danse', 'Piste de danse', 'lieu', 12),
  ('photobooth', 'Photobooth', 'lieu', 13)
on conflict (slug) do nothing;
