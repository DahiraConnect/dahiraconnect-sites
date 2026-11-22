-- Journal : distinguer l'annonce des autres paramètres du dahira
create or replace function public.audit_dahira() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.board is distinct from new.board then
    perform public.log_activity(new.id, 'update', 'board', null, 'Bureau');
  end if;
  if old.profile -> 'announcement' is distinct from new.profile -> 'announcement' then
    perform public.log_activity(new.id, 'update', 'profile', null,
      case when coalesce((new.profile -> 'announcement' ->> 'active')::boolean, false) then 'Annonce' else 'Annonce (retirée)' end);
  end if;
  if (old.profile - 'announcement') is distinct from (new.profile - 'announcement') then
    perform public.log_activity(new.id, 'update', 'profile', null, 'Paramètres');
  end if;
  if old.content is distinct from new.content then
    perform public.log_activity(new.id, 'update', 'content', null, 'Textes du site');
  end if;
  return null;
end $$;
revoke execute on function public.audit_dahira() from public, anon, authenticated;
