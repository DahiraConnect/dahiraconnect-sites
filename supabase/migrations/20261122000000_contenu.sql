-- DahiraConnect : contenu public des dahiras, modifiable depuis le back-office.
-- Les objets JSON (profil, événement, album, bureau…) suivent les interfaces de src/app/core/models.

create table public.dahiras (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  profile jsonb not null,                      -- Dahira (tenant.json)
  content jsonb not null default '{}'::jsonb,  -- PageContent (content.json)
  board jsonb not null default '{"people":[],"executive":[],"commissions":[]}'::jsonb,
  quiz jsonb,
  updated_at timestamptz not null default now()
);

-- Qui peut modifier quel dahira
create table public.dahira_admins (
  dahira_id uuid not null references public.dahiras on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now(),
  primary key (dahira_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  dahira_id uuid not null references public.dahiras on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  starts_at timestamptz not null,
  data jsonb not null,                         -- DahiraEvent
  updated_at timestamptz not null default now(),
  unique (dahira_id, slug)
);
create index events_dahira_starts on public.events (dahira_id, starts_at);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  dahira_id uuid not null references public.dahiras on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  date date not null,
  data jsonb not null,                         -- Album
  updated_at timestamptz not null default now(),
  unique (dahira_id, slug)
);
create index albums_dahira_date on public.albums (dahira_id, date desc);

-- Date de modification automatique
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger dahiras_touch before update on public.dahiras for each row execute function public.touch_updated_at();
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
create trigger albums_touch before update on public.albums for each row execute function public.touch_updated_at();

-- L'utilisateur connecté gère-t-il ce dahira ?
create function public.is_dahira_admin(d uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.dahira_admins a where a.dahira_id = d and a.user_id = (select auth.uid()));
$$;
create function public.is_dahira_admin_slug(s text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.dahira_admins a join public.dahiras d on d.id = a.dahira_id
    where d.slug = s and a.user_id = (select auth.uid())
  );
$$;

-- Sécurité : lecture publique, écriture réservée aux responsables du dahira
alter table public.dahiras enable row level security;
alter table public.dahira_admins enable row level security;
alter table public.events enable row level security;
alter table public.albums enable row level security;

create policy "lecture publique" on public.dahiras for select using (true);
create policy "modification par les responsables" on public.dahiras for update
  using (public.is_dahira_admin(id)) with check (public.is_dahira_admin(id));

create policy "ses propres droits" on public.dahira_admins for select
  using (user_id = (select auth.uid()));

create policy "lecture publique" on public.events for select using (true);
create policy "ajout par les responsables" on public.events for insert with check (public.is_dahira_admin(dahira_id));
create policy "modification par les responsables" on public.events for update
  using (public.is_dahira_admin(dahira_id)) with check (public.is_dahira_admin(dahira_id));
create policy "suppression par les responsables" on public.events for delete using (public.is_dahira_admin(dahira_id));

create policy "lecture publique" on public.albums for select using (true);
create policy "ajout par les responsables" on public.albums for insert with check (public.is_dahira_admin(dahira_id));
create policy "modification par les responsables" on public.albums for update
  using (public.is_dahira_admin(dahira_id)) with check (public.is_dahira_admin(dahira_id));
create policy "suppression par les responsables" on public.albums for delete using (public.is_dahira_admin(dahira_id));

-- Photos : bucket public, un dossier par dahira (<slug>/...)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']);

-- Lecture via l'API (nécessaire pour remplacer ou supprimer) ; l'affichage public passe par l'URL publique
create policy "media : lecture par les responsables" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_dahira_admin_slug((storage.foldername(name))[1]));
create policy "media : ajout par les responsables" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_dahira_admin_slug((storage.foldername(name))[1]));
create policy "media : modification par les responsables" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_dahira_admin_slug((storage.foldername(name))[1]));
create policy "media : suppression par les responsables" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_dahira_admin_slug((storage.foldername(name))[1]));
