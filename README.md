# DahiraConnect — site public (V1)

Angular 20 (standalone, signals, OnPush) + SSR. Brief complet : [Claude.md](Claude.md).

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm start` | Serveur de dev sur <http://localhost:4200> (dahira par défaut, ou `?tenant=<slug>`) |
| `npm test` | Tests unitaires (utilitaires dates / WhatsApp, résolution du dahira, thème) |
| `npm run build` | Build navigateur + serveur dans `dist/` |
| `npm run serve:ssr:dahiraconnect` | Lance le serveur SSR compilé (port 4000) |
| `npm run icons` | Régénère le sous-ensemble d'icônes Phosphor (nécessite `pip install fonttools brotli`) |

### SSR en local

Le serveur n'accepte que les hôtes `dahiraconnect.sn` et `*.dahiraconnect.sn` (protection SSRF).
Pour tester en local :

```bash
NG_ALLOWED_HOSTS=localhost npm run serve:ssr:dahiraconnect
```

## Repères

- **Dahira courant** : déduit du sous-domaine (`core/tenant/tenant.config.ts`), chargé avant le premier rendu.
- **Données de démo** : `src/assets/mock/*.json`, embarquées dans le bundle (`core/data/tenant-bundle.ts`).
  Les services (`EventService`, `AlbumService`…) exposent des signaux ; ce sont eux qu'on rebranchera sur Supabase.
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
