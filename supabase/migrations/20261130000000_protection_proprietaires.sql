-- Protection des propriétaires : un propriétaire ne peut ni rétrograder ni retirer un AUTRE propriétaire.
-- Seul l'intéressé peut quitter ce rôle (et il doit toujours rester au moins un propriétaire).

create or replace function public.set_team_role(d uuid, member uuid, new_role text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target_role text; -- (pas « current_role » : mot réservé de PostgreSQL)
begin
  if not public.is_dahira_owner(d) then raise exception 'Réservé aux propriétaires'; end if;
  if new_role not in ('owner', 'editor', 'none') then raise exception 'Rôle inconnu'; end if;
  select role into target_role from public.dahira_admins where dahira_id = d and user_id = member;
  if target_role is null then raise exception 'Responsable introuvable'; end if;
  if target_role = 'owner' and member <> (select auth.uid()) and new_role <> 'owner' then
    raise exception 'Un propriétaire ne peut pas être modifié par un autre propriétaire';
  end if;
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
revoke execute on function public.set_team_role(uuid, uuid, text) from public, anon;
grant execute on function public.set_team_role(uuid, uuid, text) to authenticated;

-- Poste au bureau : chacun pour soi ; un propriétaire pour les éditeurs (pas pour un autre propriétaire)
create or replace function public.set_team_person(d uuid, member uuid, person text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target_role text;
begin
  select role into target_role from public.dahira_admins where dahira_id = d and user_id = member;
  if target_role is null then raise exception 'Responsable introuvable'; end if;
  if not (
    (member = (select auth.uid()) and public.is_dahira_admin(d))
    or (public.is_dahira_owner(d) and target_role = 'editor')
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

notify pgrst, 'reload schema';
