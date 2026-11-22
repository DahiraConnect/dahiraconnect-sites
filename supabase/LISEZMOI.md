# Back-office : mise en ligne

Le site public reste un site statique (rapide, bien référencé). Le back-office (`/admin`)
enregistre le contenu dans Supabase, puis demande à Cloudflare de régénérer le site (2 à 3 minutes).

```
Responsable (téléphone) ──► /admin ──► Supabase (base + photos)
                                   └─► fonction « publish » ──► crochet Cloudflare ──► build
Build Cloudflare : scripts/pull-content.mjs lit Supabase ──► src/assets/mock/*.json ──► pages générées
```

## 1. Créer le projet Supabase

1. <https://supabase.com> → **New project** (région : *West EU (Paris)*, la plus proche du Sénégal).
2. **SQL Editor** → exécuter, dans l'ordre, les fichiers de `migrations/` (contenu, puis droits d'accès :
   les nouveaux projets n'exposent plus les tables à l'API sans `GRANT`).
3. Données de départ : `npm run seed`, puis coller `seed.sql` dans le **SQL Editor** et exécuter.
4. **Project Settings → API Keys** : copier l'URL du projet et la clé publique (`sb_publishable_…`) dans `src/environments/supabase.ts`.

## 2. Connexion par code

- **Authentication → Sign In / Providers → Email** : activer, et **désactiver « Allow new users to sign up »**
  (seuls les responsables ajoutés à la main peuvent entrer).
- Réglages déjà dans `config.toml` (bloc `[remotes.production]`) : `supabase config push` les applique
  (inscriptions fermées, code à 6 chiffres, adresse de retour `/admin/**`).
- **E-mail reçu** : avec l'expéditeur intégré de l'offre gratuite, le modèle ne peut pas être modifié :
  l'e-mail contient un **lien** (l'admin l'accepte). Pour un e-mail en français avec **code + lien**,
  configurer un SMTP (**Authentication → Emails → SMTP Settings**), puis coller `templates/code-connexion.html`
  dans **Emails → Magic Link** (sujet « Votre code de connexion »).
- **Authentication → URL Configuration** : *Site URL* = `https://moutahabina.akkili.sn`.
- Conseillé : un envoi d'e-mails à vous (**SMTP**, ex. Brevo ou Resend) ; l'envoi intégré est limité à quelques e-mails par heure.

## 3. Ajouter un responsable

1. **Authentication → Users → Add user → Send invitation** (ou *Create new user*) avec son e-mail.
2. **SQL Editor** :

```sql
insert into public.dahira_admins (dahira_id, user_id, role)
select d.id, u.id, 'owner'            -- 'editor' pour un simple contributeur
from public.dahiras d, auth.users u
where d.slug = 'moutahabina' and u.email = 'adresse@exemple.sn';
```

## 4. Republication automatique

1. Cloudflare → **Workers & Pages → dahiraconnect → Settings → Builds → Deploy hooks** :
   créer un crochet (branche `main`) et copier son adresse.
2. Déployer la fonction et enregistrer le crochet :

```sh
supabase login
supabase link --project-ref <ref-du-projet>
supabase functions deploy publish
supabase secrets set DEPLOY_HOOK_MOUTAHABINA=<adresse-du-crochet>
```

3. Cloudflare → **Settings → Variables and secrets** (Production) :
   `SUPABASE_URL` et `SUPABASE_ANON_KEY` (l'URL et la clé publique de l'étape 1).
   Sans elles, le build utilise les fichiers JSON du dépôt.

## En local

```sh
supabase start          # ports 564xx (voir config.toml) ; e-mails lisibles sur http://127.0.0.1:56424
npm start               # /admin utilise le Supabase local (src/environments/supabase.development.ts)
```

Créer un responsable local : *Studio* (<http://127.0.0.1:56423>) → Authentication → Add user,
puis la requête SQL de l'étape 3.

## Bon à savoir

- **Sécurité** : lecture publique ; écriture uniquement pour les responsables du dahira (règles RLS).
  La clé `anon` peut être publique ; la clé `service_role` ne doit **jamais** quitter Supabase.
- **Photos** : réduites sur le téléphone avant l'envoi (1600 px + vignette 640 px, WebP), 5 Mo maximum.
- **Adresses des pages** : celle d'un événement ou d'un album ne change jamais après création
  (les liens déjà partagés sur WhatsApp continuent de fonctionner).
- **Quiz, histoire, lignée, charte** : toujours dans les fichiers JSON du dépôt (pas encore dans l'admin).
