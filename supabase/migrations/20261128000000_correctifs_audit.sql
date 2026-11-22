-- Correctifs issus de l'audit (base de données et sécurité)

-- 1. Anti-doublon : les noms en arabe (ou toute écriture non latine) étaient réduits à une clé vide
create or replace function public.name_key(first text, last text) returns text
language sql immutable set search_path = '' as $$
  select array_to_string(array(
    select w from unnest(regexp_split_to_array(
      regexp_replace(lower(extensions.unaccent(coalesce(first, '') || ' ' || coalesce(last, ''))), '[^[:alnum:]]+', ' ', 'g'),
      ' ')) as w
    where w <> '' order by w
  ), ' ');
$$;
update public.event_registrations set name_key = public.name_key(first_name, last_name);
alter table public.event_registrations add constraint event_registrations_name_key_check check (name_key <> '');

-- 2. Une inscription appartient toujours au dahira de son événement (impossible de la rattacher ailleurs)
create or replace function public.registration_set_key() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.first_name := trim(regexp_replace(new.first_name, '\s+', ' ', 'g'));
  new.last_name := trim(regexp_replace(new.last_name, '\s+', ' ', 'g'));
  new.phone := nullif(trim(new.phone), '');
  new.name_key := public.name_key(new.first_name, new.last_name);
  select e.dahira_id into new.dahira_id from public.events e where e.id = new.event_id;
  return new;
end $$;

-- 3. Inscription publique : verrou par événement (la limite de places ne peut plus être dépassée
--    par deux inscriptions simultanées) et noms sans caractères de formule
create or replace function public.register_for_event(
  p_dahira text, p_event text, p_first text, p_last text, p_phone text default null, p_people integer default 1
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  st jsonb;
  e record;
  reg jsonb;
  phone_rule text;
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  select ev.id, ev.dahira_id, ev.data into e
  from public.events ev join public.dahiras d on d.id = ev.dahira_id
  where d.slug = p_dahira and ev.slug = p_event;
  if e.id is null then
    return jsonb_build_object('status', 'unknown');
  end if;
  -- Une inscription à la fois par événement : le calcul des places restantes reste juste
  perform pg_advisory_xact_lock(hashtextextended(e.id::text, 0));

  st := public.registration_status(p_dahira, p_event);
  if not coalesce((st ->> 'open')::boolean, false) then
    return jsonb_build_object('status', coalesce(st ->> 'reason', 'closed'));
  end if;
  reg := e.data -> 'registration';
  phone_rule := coalesce(reg ->> 'phone', 'optional');

  if char_length(trim(coalesce(p_first, ''))) not between 1 and 60
     or char_length(trim(coalesce(p_last, ''))) not between 1 and 60
     -- Un nom commence par une lettre (pas de « = », « + », « @ »… : formules de tableur)
     or trim(p_first) !~ '^[[:alpha:]]' or trim(p_last) !~ '^[[:alpha:]]'
     or (phone_rule = 'required' and char_length(digits) < 9)
     or (digits <> '' and char_length(digits) not between 9 and 15)
     or coalesce(p_people, 1) not between 1 and 20 then
    return jsonb_build_object('status', 'invalid');
  end if;
  if (select count(*) from public.event_registrations where event_id = e.id) >= 2000 then
    return jsonb_build_object('status', 'full');
  end if;
  if (st ->> 'remaining') is not null and coalesce(p_people, 1) > (st ->> 'remaining')::integer then
    return jsonb_build_object('status', 'full');
  end if;

  begin
    insert into public.event_registrations (dahira_id, event_id, first_name, last_name, phone, people, source)
    values (
      e.dahira_id, e.id, p_first, p_last,
      case when phone_rule = 'hidden' then null else nullif(p_phone, '') end,
      case when coalesce((reg ->> 'askPeople')::boolean, false) then coalesce(p_people, 1) else 1 end,
      'site'
    );
  exception when unique_violation then
    return jsonb_build_object('status', 'duplicate');
  end;
  return jsonb_build_object('status', 'ok');
end $$;
grant execute on function public.register_for_event(text, text, text, text, text, integer) to anon, authenticated;

-- 4. Supprimer un dahira : le journal ne bloque plus la suppression en cascade
create or replace function public.audit_doc() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ent text := case tg_table_name when 'events' then 'event' else 'album' end;
  rec record := case tg_op when 'DELETE' then old else new end;
  act text := lower(tg_op);
begin
  -- Suppression du dahira entier : rien à journaliser (le journal part avec lui)
  if tg_op = 'DELETE' and not exists (select 1 from public.dahiras where id = old.dahira_id) then
    return null;
  end if;
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    act := case new.status when 'published' then 'publish' when 'draft' then 'unpublish' else 'schedule' end;
  end if;
  perform public.log_activity(rec.dahira_id, act, ent, rec.id::text, rec.data ->> 'title');
  return null;
end $$;
revoke execute on function public.audit_doc() from public, anon, authenticated;

-- 5. Deux responsables en même temps : numéro de version (verrou optimiste)
--    L'admin n'enregistre que si personne n'a modifié le dahira depuis son chargement.
alter table public.dahiras add column version integer not null default 1;

-- 6. L'adresse (slug) d'un dahira ne change pas depuis le back-office
create or replace function public.dahira_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.slug is distinct from old.slug and coalesce(auth.role(), '') <> 'service_role' and current_user <> 'postgres' then
    raise exception 'L’adresse du dahira ne peut pas être modifiée ici';
  end if;
  new.version := old.version + 1;
  return new;
end $$;
create trigger dahiras_guard before update on public.dahiras for each row execute function public.dahira_guard();

-- 7. Statistiques : au plus 500 lignes nouvelles par dahira et par jour (pas de gonflement infini)
create or replace function public.track(p_slug text, p_kind text, p_key text, p_device text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare d uuid;
begin
  if p_kind not in ('view', 'click') or p_key !~ '^[a-z0-9/_:.-]{1,120}$' then
    return;
  end if;
  select id into d from public.dahiras where slug = p_slug;
  if d is null then return; end if;
  if not exists (
    select 1 from public.stats_daily
    where dahira_id = d and day = (now() at time zone 'utc')::date and kind = p_kind and key = p_key
  ) and (
    select count(*) from public.stats_daily where dahira_id = d and day = (now() at time zone 'utc')::date
  ) >= 500 then
    return;
  end if;
  insert into public.stats_daily (dahira_id, kind, key, count)
  values (d, p_kind, p_key, 1)
  on conflict (dahira_id, day, kind, key) do update set count = public.stats_daily.count + 1;
  if p_device in ('mobile', 'tablet', 'desktop') then
    insert into public.stats_daily (dahira_id, kind, key, count)
    values (d, 'device', p_kind || ':' || p_device, 1)
    on conflict (dahira_id, day, kind, key) do update set count = public.stats_daily.count + 1;
  end if;
end $$;
grant execute on function public.track(text, text, text, text) to anon, authenticated;

-- 8. Index manquant (droits des responsables)
create index if not exists dahira_admins_user on public.dahira_admins (user_id);

notify pgrst, 'reload schema';
