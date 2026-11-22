-- Gestion interne : statuts de publication, journal d'activité, statistiques anonymes,
-- équipe de responsables, publication programmée.

-- ——— 1. Statuts : brouillon, publié, programmé ———
alter table public.events
  add column status text not null default 'published' check (status in ('draft', 'published', 'scheduled')),
  add column publish_at timestamptz;
alter table public.albums
  add column status text not null default 'published' check (status in ('draft', 'published', 'scheduled')),
  add column publish_at timestamptz;

-- Le public ne voit que le contenu publié (ou programmé et arrivé à échéance) ; les responsables voient tout
drop policy "lecture publique" on public.events;
drop policy "lecture publique" on public.albums;
create policy "lecture : publié ou responsable" on public.events for select using (
  status = 'published' or (status = 'scheduled' and publish_at <= now()) or public.is_dahira_admin(dahira_id)
);
create policy "lecture : publié ou responsable" on public.albums for select using (
  status = 'published' or (status = 'scheduled' and publish_at <= now()) or public.is_dahira_admin(dahira_id)
);

create function public.is_dahira_owner(d uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.dahira_admins a
    where a.dahira_id = d and a.user_id = (select auth.uid()) and a.role = 'owner'
  );
$$;
grant execute on function public.is_dahira_owner(uuid) to authenticated;

-- ——— 2. Journal d'activité ———
create table public.audit_log (
  id bigint generated always as identity primary key,
  dahira_id uuid not null references public.dahiras on delete cascade,
  user_id uuid,
  user_email text,
  action text not null,        -- create | update | delete | publish | team
  entity text not null,        -- event | album | board | profile | content | team
  entity_id text,
  label text,
  created_at timestamptz not null default now()
);
create index audit_log_dahira_date on public.audit_log (dahira_id, created_at desc);
alter table public.audit_log enable row level security;
create policy "lecture par les responsables" on public.audit_log for select using (public.is_dahira_admin(dahira_id));
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

create function public.log_activity(d uuid, act text, ent text, ent_id text, lbl text) returns void
language sql security definer set search_path = '' as $$
  insert into public.audit_log (dahira_id, user_id, user_email, action, entity, entity_id, label)
  values (d, (select auth.uid()), coalesce((select auth.jwt() ->> 'email'), 'Système'), act, ent, ent_id, lbl);
$$;
-- Appelée seulement par les déclencheurs et fonctions ci-dessous (jamais directement depuis l'API)
revoke execute on function public.log_activity(uuid, text, text, text, text) from public, anon, authenticated;

-- Événements et albums : création, modification, suppression, changement de statut
create function public.audit_doc() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ent text := case tg_table_name when 'events' then 'event' else 'album' end;
  rec record := case tg_op when 'DELETE' then old else new end;
  act text := lower(tg_op);
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    act := case new.status when 'published' then 'publish' when 'draft' then 'unpublish' else 'schedule' end;
  end if;
  perform public.log_activity(rec.dahira_id, act, ent, rec.id::text, rec.data ->> 'title');
  return null;
end $$;
create trigger events_audit after insert or update or delete on public.events
  for each row execute function public.audit_doc();
create trigger albums_audit after insert or update or delete on public.albums
  for each row execute function public.audit_doc();

-- Dahira : quelle partie a changé
create function public.audit_dahira() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.board is distinct from new.board then
    perform public.log_activity(new.id, 'update', 'board', null, 'Bureau');
  end if;
  if old.profile is distinct from new.profile then
    perform public.log_activity(new.id, 'update', 'profile', null, 'Paramètres');
  end if;
  if old.content is distinct from new.content then
    perform public.log_activity(new.id, 'update', 'content', null, 'Textes du site');
  end if;
  return null;
end $$;
create trigger dahiras_audit after update on public.dahiras
  for each row execute function public.audit_dahira();

-- ——— 3. Statistiques anonymes (aucune donnée personnelle, aucun cookie) ———
create table public.stats_daily (
  dahira_id uuid not null references public.dahiras on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  kind text not null check (kind in ('view', 'click')),
  key text not null,
  count integer not null default 0,
  primary key (dahira_id, day, kind, key)
);
alter table public.stats_daily enable row level security;
create policy "lecture par les responsables" on public.stats_daily for select using (public.is_dahira_admin(dahira_id));
grant select on public.stats_daily to authenticated;
grant all on public.stats_daily to service_role;

-- Appelée par le site public : +1 sur la page vue ou le bouton touché du jour
create function public.track(p_slug text, p_kind text, p_key text) returns void
language plpgsql security definer set search_path = '' as $$
declare d uuid;
begin
  if p_kind not in ('view', 'click') or p_key !~ '^[a-z0-9/_:.-]{1,120}$' then
    return;
  end if;
  select id into d from public.dahiras where slug = p_slug;
  if d is null then return; end if;
  insert into public.stats_daily (dahira_id, kind, key, count)
  values (d, p_kind, p_key, 1)
  on conflict (dahira_id, day, kind, key) do update set count = public.stats_daily.count + 1;
end $$;
grant execute on function public.track(text, text, text) to anon, authenticated;

-- ——— 4. Équipe de responsables ———
-- Liste avec e-mails (lisibles seulement par les responsables du dahira)
create function public.list_team(d uuid)
returns table (user_id uuid, email text, role text, created_at timestamptz, last_sign_in_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.user_id, u.email::text, a.role, a.created_at, u.last_sign_in_at
  from public.dahira_admins a join auth.users u on u.id = a.user_id
  where a.dahira_id = d and public.is_dahira_admin(d)
  order by a.role desc, u.email;
$$;
grant execute on function public.list_team(uuid) to authenticated;

-- Changer le rôle ou retirer quelqu'un : propriétaires uniquement, jamais le dernier propriétaire
create function public.set_team_role(d uuid, member uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_dahira_owner(d) then raise exception 'Réservé aux propriétaires'; end if;
  if new_role not in ('owner', 'editor', 'none') then raise exception 'Rôle inconnu'; end if;
  if new_role <> 'owner' and (select count(*) from public.dahira_admins
      where dahira_id = d and role = 'owner' and user_id <> member) = 0 then
    raise exception 'Il doit rester au moins un propriétaire';
  end if;
  if new_role = 'none' then
    delete from public.dahira_admins where dahira_id = d and user_id = member;
  else
    update public.dahira_admins set role = new_role where dahira_id = d and user_id = member;
  end if;
  perform public.log_activity(d, 'team', 'team', member::text,
    case new_role when 'none' then 'a retiré un responsable de l’équipe'
      when 'owner' then 'a nommé un responsable propriétaire' else 'a nommé un responsable éditeur' end);
end $$;
grant execute on function public.set_team_role(uuid, uuid, text) to authenticated;

-- ——— 5. Publication programmée ———
-- Crochet de republication par dahira (jamais lisible depuis l'API)
create table public.dahira_private (
  dahira_id uuid primary key references public.dahiras on delete cascade,
  deploy_hook text
);
alter table public.dahira_private enable row level security;
grant all on public.dahira_private to service_role;

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Toutes les 10 minutes : publie ce qui est arrivé à échéance et republie le site concerné
create function public.publish_due() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  n integer := 0;
  hook text;
  d uuid;
begin
  for d in
    with e as (
      update public.events set status = 'published'
      where status = 'scheduled' and publish_at <= now() returning dahira_id
    ), a as (
      update public.albums set status = 'published'
      where status = 'scheduled' and publish_at <= now() returning dahira_id
    )
    select distinct dahira_id from (select dahira_id from e union all select dahira_id from a) x
  loop
    n := n + 1;
    select deploy_hook into hook from public.dahira_private where dahira_id = d;
    if hook is not null then
      perform net.http_post(url := hook, body := '{}'::jsonb);
    end if;
  end loop;
  return n;
end $$;
revoke execute on function public.publish_due() from public, anon, authenticated;

select cron.schedule('publication-programmee', '*/10 * * * *', 'select public.publish_due()');

-- Invitation d'un responsable (fonction « team ») : retrouve un compte existant par e-mail
create function public.find_user_id(p_email text) returns uuid
language sql stable security definer set search_path = '' as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;
revoke execute on function public.find_user_id(text) from public, anon, authenticated;
grant execute on function public.find_user_id(text) to service_role;
grant execute on function public.log_activity(uuid, text, text, text, text) to service_role;

-- Fonctions de déclencheur : jamais appelables depuis l'API
revoke execute on function public.audit_doc() from public, anon, authenticated;
revoke execute on function public.audit_dahira() from public, anon, authenticated;
