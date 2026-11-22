-- Tableau de bord : prénom des responsables dans le journal, type d'appareil dans les statistiques

-- 1. Journal : prénom choisi dans « Mon profil » (métadonnées du compte), sinon l'e-mail
alter table public.audit_log add column user_name text;

create or replace function public.log_activity(d uuid, act text, ent text, ent_id text, lbl text) returns void
language sql security definer set search_path = '' as $$
  insert into public.audit_log (dahira_id, user_id, user_email, user_name, action, entity, entity_id, label)
  values (
    d, (select auth.uid()),
    coalesce((select auth.jwt() ->> 'email'), 'Système'),
    nullif(trim((select auth.jwt() -> 'user_metadata' ->> 'name')), ''),
    act, ent, ent_id, lbl
  );
$$;
revoke execute on function public.log_activity(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.log_activity(uuid, text, text, text, text) to service_role;

-- 2. Statistiques : téléphone, tablette ou ordinateur (compté à part, toujours anonyme)
alter table public.stats_daily drop constraint stats_daily_kind_check;
alter table public.stats_daily add constraint stats_daily_kind_check check (kind in ('view', 'click', 'device'));

drop function public.track(text, text, text);
create function public.track(p_slug text, p_kind text, p_key text, p_device text default null) returns void
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
  if p_device in ('mobile', 'tablet', 'desktop') then
    insert into public.stats_daily (dahira_id, kind, key, count)
    values (d, 'device', p_kind || ':' || p_device, 1)
    on conflict (dahira_id, day, kind, key) do update set count = public.stats_daily.count + 1;
  end if;
end $$;
grant execute on function public.track(text, text, text, text) to anon, authenticated;

-- L'API (PostgREST) recharge la liste des fonctions
notify pgrst, 'reload schema';
