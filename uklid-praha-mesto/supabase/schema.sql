-- Úklid Praha Město – databáze pro ostrý provoz (Supabase)
-- Spusťte celé v Supabase → SQL Editor. Skript lze pustit opakovaně.

create extension if not exists pgcrypto;

-- Zaměstnanci: propojení účtu (Authentication → Users) se jménem
create table if not exists public.employees (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  label text not null,
  address text not null,
  created_at timestamptz not null default now()
);
create index if not exists places_client_idx on public.places (client_id);

create table if not exists public.cleanings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  place_id uuid references public.places (id) on delete set null,
  employee_id uuid default auth.uid() references auth.users (id) on delete set null,
  employee_name text,
  date date not null,
  start_time time not null,
  end_time time not null,
  tasks text[] not null default '{}',
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists cleanings_client_idx on public.cleanings (client_id, date desc);

create table if not exists public.cleaning_photos (
  id uuid primary key default gen_random_uuid(),
  cleaning_id uuid not null references public.cleanings (id) on delete cascade,
  path text not null,
  kind text not null check (kind in ('pred', 'po')),
  created_at timestamptz not null default now()
);
create index if not exists cleaning_photos_cleaning_idx on public.cleaning_photos (cleaning_id);

-- Je přihlášený uživatel zaměstnanec?
create or replace function public.is_employee()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.employees where user_id = auth.uid()) $$;

-- Row Level Security: data vidí a upravují jen zaměstnanci.
alter table public.employees enable row level security;
alter table public.clients enable row level security;
alter table public.places enable row level security;
alter table public.cleanings enable row level security;
alter table public.cleaning_photos enable row level security;

drop policy if exists "employee reads self" on public.employees;
create policy "employee reads self" on public.employees for select to authenticated using (user_id = auth.uid());

drop policy if exists "employees manage clients" on public.clients;
create policy "employees manage clients" on public.clients for all to authenticated using (public.is_employee()) with check (public.is_employee());

drop policy if exists "employees manage places" on public.places;
create policy "employees manage places" on public.places for all to authenticated using (public.is_employee()) with check (public.is_employee());

drop policy if exists "employees manage cleanings" on public.cleanings;
create policy "employees manage cleanings" on public.cleanings for all to authenticated using (public.is_employee()) with check (public.is_employee());

drop policy if exists "employees manage photos" on public.cleaning_photos;
create policy "employees manage photos" on public.cleaning_photos for all to authenticated using (public.is_employee()) with check (public.is_employee());

-- Klient bez účtu: data jen pro jeden přístupový kód, nic jiného.
create or replace function public.client_portal(p_code text)
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'client', json_build_object('id', c.id, 'name', c.name),
    'places', coalesce((
      select json_agg(json_build_object('id', p.id, 'label', p.label, 'address', p.address) order by p.label)
      from public.places p where p.client_id = c.id
    ), '[]'::json),
    'cleanings', coalesce((
      select json_agg(json_build_object(
        'id', k.id,
        'place_id', k.place_id,
        -- klientovi ukazujeme jen křestní jméno pracovnice
        'employee_name', split_part(coalesce(k.employee_name, ''), ' ', 1),
        'date', k.date,
        'start_time', to_char(k.start_time, 'HH24:MI'),
        'end_time', to_char(k.end_time, 'HH24:MI'),
        'tasks', k.tasks,
        'note', k.note,
        'photos', coalesce((
          select json_agg(json_build_object('id', f.id, 'path', f.path, 'kind', f.kind, 'created_at', f.created_at) order by f.created_at)
          from public.cleaning_photos f where f.cleaning_id = k.id
        ), '[]'::json)
      ) order by k.date desc, k.start_time desc)
      from public.cleanings k where k.client_id = c.id
    ), '[]'::json)
  )
  from public.clients c
  where upper(c.access_code) = upper(trim(p_code))
  limit 1
$$;

revoke all on function public.client_portal(text) from public;
grant execute on function public.client_portal(text) to anon, authenticated;

-- Úložiště fotek. Veřejný bucket, ale cesty obsahují náhodná UUID,
-- takže fotku uvidí jen ten, kdo zná odkaz (tj. klient se svým kódem).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "employees upload photos" on storage.objects;
create policy "employees upload photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_employee());

drop policy if exists "employees delete photos" on storage.objects;
create policy "employees delete photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_employee());

-- ---------------------------------------------------------------------------
-- Přidání zaměstnance:
--   1) Authentication → Users → Add user (e-mail + heslo, „Auto confirm“)
--   2) spusťte:
--      insert into public.employees (user_id, name)
--      select id, 'Jana Dvořáková' from auth.users where email = 'jana@example.cz';
-- ---------------------------------------------------------------------------
