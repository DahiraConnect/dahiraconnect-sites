# Worker multi-dahira — chantier 4.6

Le profil Worker rend les pages Angular avec le contenu public du sous-domaine demandé. `npm run build` et `npm run deploy` conservent le site statique Pages pendant la transition.

## Vérification locale

```sh
npm ci
npm run types:worker
npm run test:worker
npm run build:worker
npm run test:worker:smoke
npm run preview
```

Le test smoke démarre une API locale simulée et le runtime Cloudflare, sans lire ni modifier la production. Il teste Moutahabina et un second dahira : pages publiques, événement, album, canonical/Open Graph, sitemap, robots, manifeste PWA, calendrier, API, HEAD et adresses inconnues. Pour vérifier aussi l’hydratation dans Chrome, définir `CHROME_BIN` avec le chemin de son exécutable.

La prévisualisation manuelle utilise les variables publiques de `wrangler.toml` et lit donc Supabase en ligne. Pour utiliser la base locale, définir `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `.dev.vars` (ignoré par Git). Sur localhost, `?tenant=adresse` sélectionne le dahira. Sur un domaine public, seul le sous-domaine compte.

Le Worker lit `sites`, `site_evenements` et `site_albums` avec la clé publique, sans reprendre les cookies ni le jeton du visiteur. Les règles RLS filtrent les dahiras hors ligne/inactifs, brouillons et publications programmées non échues. Il ne lit ni participants, ni équipe, ni journal, ni configuration privée. Un site absent répond 404 ; une panne de base répond 503 sans contenu de démonstration.

Le contenu public est mis en cache 120 secondes sous l’URL `https://<adresse>.akkili.sn/api/site`. Les pages HTML et réponses navigateur ne sont pas mises en cache. La mise hors ligne et les modifications peuvent donc prendre jusqu’à 120 secondes sans purge. Le Worker est placé près de Supabase en Irlande (`aws:eu-west-1`).

Le manifeste reste installable. Le service worker statique est désactivé dans le profil Worker ; son manifeste `/ngsw.json` répond 404 pour retirer les anciennes installations. L’usage hors ligne doit être réintroduit avec une stratégie adaptée aux données dynamiques. Les autres dahiras utilisent leur logo pour les icônes ; Moutahabina conserve ses icônes existantes.

## Prévisualisation sans changer le DNS

Le profil `preview` publie un Worker distinct, `dahiraconnect-preview`, sur `https://dahiraconnect-preview.diemelamine398.workers.dev` :

```sh
npm run deploy:worker:preview
```

Cette adresse est publique. Elle ne sert que le site publié `moutahabina`, lu anonymement dans Supabase, et répond avec `X-Robots-Tag: noindex, nofollow`. Seul l’hôte configuré peut être réécrit vers le site sélectionné ; ni un paramètre `tenant` ni un en-tête visiteur ne permettent de choisir un autre site. Les paramètres sont vides dans la configuration de production. Les clés de cache gardent l’hôte d’origine pour isoler la prévisualisation.

Le build, 11 tests unitaires du Worker et le test du runtime couvrant les deux configurations ont été exécutés localement. L’envoi vers Cloudflare a été explicitement autorisé le 23/11/2026. La prévisualisation a été déployée et vérifiée en ligne (version `c0af455a-b0ab-46aa-8143-1c2c61a6efc2`).

Vérifié sur cette version : les huit pages publiques principales, une fiche événement et un album, le logo, le manifeste, le sitemap, les robots, le calendrier, l’API et une vraie 404. Les titres, adresses canoniques et métadonnées de partage des pages comparées correspondent au site Pages actuel. Supabase fournit 3 événements et 5 albums ; un paramètre `tenant` visiteur ne change pas le site de prévisualisation. Toutes les réponses testées portent l’en-tête `noindex, nofollow`. Le rendu et l’hydratation Angular ont aussi été vérifiés dans Chrome sur cette adresse publique.

Le test en ligne a révélé qu’Angular valide aussi l’en-tête `Host`. La réécriture de prévisualisation aligne désormais cet en-tête avec l’URL et retire les en-têtes de transfert d’hôte. Le test du runtime reproduit cette requête, y compris le rendu HTML, pour éviter une régression.

## Préparer la bascule en production

Constat du 23/11/2026 : la zone `akkili.sn` du compte Cloudflare connecté est `pending`. Le projet Pages `dahiraconnect-sites` sert encore `moutahabina.akkili.sn`. Le profil Worker n’est pas encore raccordé aux domaines ; aucune migration SQL n’est nécessaire. Les deux demandes de fusion initiales ont été fusionnées et leurs contrôles GitHub sont au vert.

L’inventaire public et les précautions avant activation sont détaillés dans [dns-akkili.md](dns-akkili.md). Les sous-domaines des applications manquent dans la copie Cloudflare actuelle.

1. Activer/vérifier la zone DNS faisant autorité pour `akkili.sn` avant de modifier le routage. Relever la configuration et le déploiement Pages actuels pour pouvoir revenir en arrière.
2. Vérifier le compte cible et le nom `dahiraconnect` avant `npm run deploy:worker`. Ne pas remplacer un Worker homonyme sans contrôler ses usages et ses bindings.
3. Préparer un DNS wildcard proxifié et une route Worker `*.akkili.sn/*`. Préserver les applications existantes avec des routes d’exclusion plus spécifiques sans script, notamment `bureau-dahiraconnect.akkili.sn/*`, `pcym2nag2r.akkili.sn/*`, `dahiraconnect.akkili.sn/*`, et tous les autres hôtes déjà utilisés. Inventorier les DNS réels avant d’appliquer la liste. La route de Moutahabina doit être explicitement incluse dans la bascule.
4. Tester en ligne Moutahabina et un second site publié : pages, thème, images, métadonnées, événements/albums, puis modifications et mise hors ligne. Vérifier l’absence d’interception des applications bureau, console et vitrine. Comparer le contenu/SEO de Moutahabina avec le site Pages actuel.
5. Déployer la fonction `site-publier` du dépôt mobile. Définir `SITE_WORKER_CACHE_ZONE_ID` avec l’ID de la zone active et `CLOUDFLARE_CACHE_PURGE_TOKEN` avec un jeton limité à **Zone / Cache Purge** sur cette zone. Ne jamais placer ce jeton dans le navigateur ou le dépôt. Le définir uniquement après la bascule : tant que `SITE_WORKER_CACHE_ZONE_ID` est absent, le crochet Pages existant reste utilisé.
6. Vérifier une publication réelle depuis le bureau et la disparition de l’ancienne valeur de `/api/site`. Les tests locaux de purge couvrent la requête et ses erreurs ; ils ne prouvent pas l’invalidation globale du CDN. La valider en production avant de déclarer 4.6 terminé.

En cas de retour à Pages, retirer `SITE_WORKER_CACHE_ZONE_ID`, remettre le routage et le déploiement Pages relevés avant la bascule, et vérifier Moutahabina. Ne pas retirer `/admin` (4.7) avant la validation en ligne de 4.6 et des aperçus/imports reportés.

Documentation : [routage des assets](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/), [placement](https://developers.cloudflare.com/workers/configuration/placement/), [AngularAppEngine](https://angular.dev/api/ssr/AngularAppEngine).
