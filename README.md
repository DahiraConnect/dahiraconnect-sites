# DahiraConnect — site public (V1)

Angular 20 (standalone, signals, OnPush) + SSR. Brief complet : [Claude.md](Claude.md).

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm start` | Serveur de dev sur <http://localhost:4200> (dahira par défaut, ou `?tenant=<slug>`) |
| `npm test` | Tests unitaires (utilitaires dates / WhatsApp, résolution du dahira, thème) |
| `npm run build` | Génère le site statique (toutes les pages pré-rendues) dans `dist/dahiraconnect/browser` |
| `npm run preview` | Sert le build comme Cloudflare Pages (Wrangler) |
| `npm run deploy` | Build puis déploiement direct sur Cloudflare Pages (Wrangler) |
| `npm run seed` | Génère `supabase/seed.sql` à partir des JSON de démo |
| `npm run icons` | Régénère le sous-ensemble d'icônes Phosphor (nécessite `pip install fonttools brotli`) |

## Déploiement (Cloudflare)

Site **statique** : chaque page (y compris chaque événement et album) est générée au build
pour le dahira par défaut. Après une modification des données (`src/assets/mock`), un nouveau
déploiement régénère les pages. Chaque `git push` sur `main` redéploie le site.

Deux façons d'héberger, avec les mêmes fichiers :

| | Cloudflare **Pages** | Cloudflare **Workers** |
| --- | --- | --- |
| Build command | `npm run build` | `npm run build` |
| Output / config | Build output directory : `dist/dahiraconnect/browser` | `wrangler.toml` (deploy command : `npx wrangler deploy`) |
| Sous-domaine dont le DNS est chez OVH | CNAME vers `<projet>.pages.dev` | Impossible : le domaine doit être géré par Cloudflare |

- `public/_headers` : cache long pour les fichiers du build, pas de cache pour le service worker.
- `404.html` est créé par `scripts/postbuild.mjs` et servi pour toute adresse inconnue.
- Adresse publique (aperçus WhatsApp) : `siteUrl` dans `tenant.json`.
- Version de Node : 22 (fichier `.node-version`).

Plus tard, plusieurs dahiras par sous-domaine : repasser en rendu serveur
(`outputMode: "server"` dans `angular.json`, `RenderMode.Server` dans `app.routes.server.ts`),
sur Cloudflare Workers. `src/server.ts` est conservé pour cela.

## Back-office (`/admin`)

Les responsables modifient l'agenda, la galerie, le bureau et les infos pratiques depuis leur téléphone
(connexion par code reçu par e-mail). Le contenu est stocké dans **Supabase** ; chaque enregistrement
relance le build Cloudflare, qui lit Supabase avant de générer les pages (`scripts/pull-content.mjs`).
Mise en place pas à pas : [supabase/LISEZMOI.md](supabase/LISEZMOI.md).

## Repères

- **Dahira courant** : déduit du sous-domaine (`core/tenant/tenant.config.ts`), chargé avant le premier rendu.
- **Données** : `src/assets/mock/*.json`, embarquées dans le bundle (`core/data/tenant-bundle.ts`).
  Avec Supabase configuré, ces fichiers sont réécrits au build depuis la base (`scripts/pull-content.mjs`).
- **Couleurs par dahira** : champ `theme` du tenant → surcharge des tokens CSS (`core/tenant/theme.initializer.ts`).
- **Images d'exemple** : `src/assets/tenants/moutahabina/exemples/` (albums, affiches, portraits de la lignée).
  Pour les remplacer : déposer les vraies photos (WebP conseillé) et mettre à jour les chemins dans `src/assets/mock/*.json`,
  avec leurs dimensions `width` / `height`. Un événement peut avoir 0, 1 (affiche) ou plusieurs `images`.
- **Réseaux sociaux** : champ `social` de `tenant.json` (tiktok, facebook, instagram, youtube, whatsapp, x).
- **Application installable (PWA)** : service worker en production (`ngsw-config.json`), hors ligne pour les pages déjà vues.
  Le manifeste est propre à chaque dahira (`/manifest.webmanifest` généré par `src/server.ts` via `core/tenant/manifest.ts`).
  Icônes d'application d'un dahira : `src/assets/tenants/<slug>/icons/` (192/512, maskable, iPhone, favicon), générées depuis son logo HD.
- **Paiements** : logos communs dans `src/assets/payments/`. Si Wave et Orange Money ont le même numéro, ils sont regroupés en une ligne.
- **Icônes** : `<i class="ph ph-nom" aria-hidden="true">`. Après avoir ajouté une icône, lancer `npm run icons`.
