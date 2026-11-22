-- Droits d'accès explicites : les nouveaux projets Supabase n'exposent plus automatiquement
-- les tables à l'API. Les règles RLS de la migration précédente restent le vrai contrôle.

grant usage on schema public to anon, authenticated, service_role;

-- Lecture publique du contenu
grant select on public.dahiras, public.events, public.albums to anon, authenticated;

-- Écriture par les responsables (filtrée par les règles RLS)
grant update on public.dahiras to authenticated;
grant insert, update, delete on public.events, public.albums to authenticated;
grant select on public.dahira_admins to authenticated;

-- Fonctions utilisées par les règles RLS
grant execute on function public.is_dahira_admin(uuid) to anon, authenticated;
grant execute on function public.is_dahira_admin_slug(text) to anon, authenticated;

-- Administration (scripts, tableau de bord)
grant all on public.dahiras, public.events, public.albums, public.dahira_admins to service_role;

-- Photos : lecture par l'API, nécessaire pour remplacer ou supprimer un fichier
-- (déjà présente si la première migration a été exécutée dans sa dernière version)
drop policy if exists "media : lecture par les responsables" on storage.objects;
create policy "media : lecture par les responsables" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_dahira_admin_slug((storage.foldername(name))[1]));
