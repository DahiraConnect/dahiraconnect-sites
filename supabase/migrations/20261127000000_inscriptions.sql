-- Inscriptions aux événements (« Je viens ») : formulaire public, liste et export côté admin.
-- Réglages par événement dans events.data.registration :
--   { enabled, closesAt?, phone: 'hidden'|'optional'|'required', askPeople?, limit? }

create extension if not exists unaccent with schema extensions;

-- Clé anti-doublon : sans accents, sans casse, mots triés (« Ndiaye Aminata » = « aminata NDIAYE »)
create function public.name_key(first text, last text) returns text
language sql immutable set search_path = '' as $$
  select array_to_string(array(
    select w from unnest(regexp_split_to_array(
      regexp_replace(lower(extensions.unaccent(coalesce(first, '') || ' ' || coalesce(last, ''))), '[^a-z0-9]+', ' ', 'g'),
      ' ')) as w
    where w <> '' order by w
  ), ' ');
$$;

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  dahira_id uuid not null references public.dahiras on delete cascade,
  event_id uuid not null references public.events on delete cascade,
  first_name text not null check (char_length(trim(first_name)) between 1 and 60),
  last_name text not null check (char_length(trim(last_name)) between 1 and 60),
  phone text check (phone is null or char_length(phone) <= 20),
  people smallint not null default 1 check (people between 1 and 20),
  name_key text not null,
  source text not null default 'site' check (source in ('site', 'admin', 'import')),
  created_at timestamptz not null default now(),
  unique (event_id, name_key)
);
create index event_registrations_event on public.event_registrations (event_id, created_at);

create function public.registration_set_key() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.first_name := trim(regexp_replace(new.first_name, '\s+', ' ', 'g'));
  new.last_name := trim(regexp_replace(new.last_name, '\s+', ' ', 'g'));
  new.phone := nullif(trim(new.phone), '');
  new.name_key := public.name_key(new.first_name, new.last_name);
  return new;
end $$;
create trigger event_registrations_key before insert or update on public.event_registrations
  for each row execute function public.registration_set_key();

alter table public.event_registrations enable row level security;
create policy "responsables : lecture" on public.event_registrations for select using (public.is_dahira_admin(dahira_id));
create policy "responsables : ajout" on public.event_registrations for insert with check (public.is_dahira_admin(dahira_id));
create policy "responsables : modification" on public.event_registrations for update
  using (public.is_dahira_admin(dahira_id)) with check (public.is_dahira_admin(dahira_id));
create policy "responsables : suppression" on public.event_registrations for delete using (public.is_dahira_admin(dahira_id));
grant select, insert, update, delete on public.event_registrations to authenticated;
grant all on public.event_registrations to service_role;

-- État public des inscriptions d'un événement (ouvertes ? places restantes ?)
create function public.registration_status(p_dahira text, p_event text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  e record;
  reg jsonb;
  taken integer;
  lim integer;
  closes timestamptz;
begin
  select ev.id, ev.starts_at, ev.data, ev.status, ev.publish_at into e
  from public.events ev join public.dahiras d on d.id = ev.dahira_id
  where d.slug = p_dahira and ev.slug = p_event;
  if e.id is null or not (e.status = 'published' or (e.status = 'scheduled' and e.publish_at <= now())) then
    return jsonb_build_object('open', false, 'reason', 'unknown');
  end if;
  reg := e.data -> 'registration';
  if reg is null or not coalesce((reg ->> 'enabled')::boolean, false) then
    return jsonb_build_object('open', false, 'reason', 'disabled');
  end if;
  closes := coalesce(nullif(reg ->> 'closesAt', '')::timestamptz, e.starts_at);
  select coalesce(sum(people), 0) into taken from public.event_registrations where event_id = e.id;
  lim := nullif(reg ->> 'limit', '')::integer;
  return jsonb_build_object(
    'open', now() < closes and (lim is null or taken < lim),
    'reason', case when now() >= closes then 'closed' when lim is not null and taken >= lim then 'full' else null end,
    'closesAt', closes,
    'remaining', case when lim is null then null else greatest(lim - taken, 0) end
  );
end $$;
grant execute on function public.registration_status(text, text) to anon, authenticated;

-- Inscription depuis le site public
create function public.register_for_event(
  p_dahira text, p_event text, p_first text, p_last text, p_phone text default null, p_people integer default 1
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  st jsonb := public.registration_status(p_dahira, p_event);
  e record;
  reg jsonb;
  phone_rule text;
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if not coalesce((st ->> 'open')::boolean, false) then
    return jsonb_build_object('status', coalesce(st ->> 'reason', 'closed'));
  end if;
  select ev.id, ev.dahira_id, ev.data into e
  from public.events ev join public.dahiras d on d.id = ev.dahira_id
  where d.slug = p_dahira and ev.slug = p_event;
  reg := e.data -> 'registration';
  phone_rule := coalesce(reg ->> 'phone', 'optional');

  if char_length(trim(coalesce(p_first, ''))) not between 1 and 60
     or char_length(trim(coalesce(p_last, ''))) not between 1 and 60
     or (phone_rule = 'required' and char_length(digits) < 9)
     or (digits <> '' and char_length(digits) not between 9 and 15)
     or coalesce(p_people, 1) not between 1 and 20 then
    return jsonb_build_object('status', 'invalid');
  end if;
  -- Garde-fou contre le remplissage abusif
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

notify pgrst, 'reload schema';
