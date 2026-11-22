-- Relier un compte de responsable à une personne du bureau (ex. : propriétaire du site ET vice-président)

alter table public.dahira_admins add column person_id text;

-- Lien : chacun pour lui-même, ou un propriétaire pour n'importe quel responsable
create function public.set_team_person(d uuid, member uuid, person text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (
    (member = (select auth.uid()) and public.is_dahira_admin(d)) or public.is_dahira_owner(d)
  ) then
    raise exception 'Non autorisé';
  end if;
  if person is not null and not exists (
    select 1 from public.dahiras x, jsonb_array_elements(x.board -> 'people') p
    where x.id = d and p ->> 'id' = person
  ) then
    raise exception 'Personne inconnue dans le bureau';
  end if;
  update public.dahira_admins set person_id = person where dahira_id = d and user_id = member;
end $$;
revoke execute on function public.set_team_person(uuid, uuid, text) from public, anon;
grant execute on function public.set_team_person(uuid, uuid, text) to authenticated;

-- L'équipe avec la personne du bureau de chacun
drop function public.list_team(uuid);
create function public.list_team(d uuid)
returns table (user_id uuid, email text, role text, person_id text, created_at timestamptz, last_sign_in_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.user_id, u.email::text, a.role, a.person_id, a.created_at, u.last_sign_in_at
  from public.dahira_admins a join auth.users u on u.id = a.user_id
  where a.dahira_id = d and public.is_dahira_admin(d)
  order by a.role desc, u.email;
$$;
revoke execute on function public.list_team(uuid) from public, anon;
grant execute on function public.list_team(uuid) to authenticated;

notify pgrst, 'reload schema';

-- Reconstruction quotidienne des sites (3 h, heure de Dakar) :
-- « Prochain rendez-vous », agenda et annonces expirées restent à jour même sans modification.
create function public.rebuild_all() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  n integer := 0;
  hook text;
begin
  for hook in select deploy_hook from public.dahira_private where deploy_hook is not null loop
    perform net.http_post(url := hook, body := '{}'::jsonb);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function public.rebuild_all() from public, anon, authenticated;

select cron.schedule('reconstruction-quotidienne', '0 3 * * *', 'select public.rebuild_all()');

-- Durées de conservation (annoncées sur la page « Confidentialité ») :
-- inscriptions 6 mois après l'événement, historique 12 mois, statistiques 24 mois.
create function public.purge_old_data() returns void
language sql security definer set search_path = '' as $$
  delete from public.event_registrations r using public.events e
    where e.id = r.event_id and e.starts_at < now() - interval '6 months';
  delete from public.audit_log where created_at < now() - interval '12 months';
  delete from public.stats_daily where day < (now() - interval '24 months')::date;
$$;
revoke execute on function public.purge_old_data() from public, anon, authenticated;

select cron.schedule('purge-donnees', '30 3 * * *', 'select public.purge_old_data()');
