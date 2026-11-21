# DahiraConnect — Brief d'implémentation Angular

> Projet porté par **Akkili**. Pilote : **Dahira Moutahabina Fillahi**.
> Ce fichier sert de référence pour coder le site public (V1) dans VS Code.
> Maquettes : canvas « Maquettes mobiles – Dahira Moutahabina Fillahi » (direction « Le médaillon »).

---

## 0. Contexte en 5 lignes

- **SaaS multi-dahiras** : un seul code, un site par dahira (`<slug>.dahiraconnect.sn`).
- **Périmètre V1** : site vitrine + back-office de contenu. **Pas** de gestion de l'organisation (membres, cotisations, finances).
- **Public** : peu à l'aise avec le numérique, mobile Android, 3G, WhatsApp. **Mobile first**, gros boutons, icône + mot.
- **Langue V1** : français uniquement (arabe et anglais en V2, avec RTL pour l'arabe).
- **Rejoindre** = bouton WhatsApp avec message prérempli, **aucun formulaire**.

---

## 1. Stack et conventions

| Sujet | Choix |
| --- | --- |
| Framework | Angular 17+ (standalone, signals, nouveau control flow `@if` / `@for` / `@defer`) |
| Rendu | Angular SSR + prérendu des pages publiques |
| Détection | `ChangeDetectionStrategy.OnPush` partout |
| API composants | `input()`, `output()`, `model()`, `signal()`, `computed()` |
| Styles | SCSS, BEM adapté (max 2 niveaux), mixins `@use 'styles/mixins' as m;`, tokens CSS uniquement |
| Icônes | Phosphor (`<i class="ph ph-...">`), toujours `aria-hidden="true"` + texte visible |
| Données V1 | JSON de démo dans `src/assets/mock/` derrière des services ; Supabase ensuite |
| Préfixe | `app-` (à confirmer) |

**Règles non négociables**
- Aucune valeur en dur dans les composants : `var(--token)`.
- États `:hover`, `:focus-visible`, `:active`, `:disabled` sur tout interactif.
- Cible tactile ≥ 44 px (boutons principaux 56–62 px).
- Texte courant ≥ 16 px, contraste ≥ 4.5:1.
- Un `<h1>` par page, vrais `<button>` / `<a href>`, labels sur les champs.

---

## 2. Arborescence

```
src/
├── styles/
│   ├── _variables.scss      tokens (valeurs par défaut = charte Moutahabina)
│   ├── _mixins.scss         mixins existants + pattern-star, arch, dark-hero
│   ├── _typography.scss     @font-face auto-hébergées + échelle
│   ├── _reset.scss
│   └── _ui.scss             utilitaires (sr-only, container…)
├── styles.scss
├── assets/
│   ├── fonts/               Young Serif, Atkinson Hyperlegible Next, Aref Ruqaa (woff2, subset)
│   ├── mock/                tenant.json, events.json, albums.json, board.json, lineage.json
│   └── tenants/moutahabina/ logo.webp
└── app/
    ├── app.config.ts
    ├── app.routes.ts
    ├── core/
    │   ├── tenant/
    │   │   ├── tenant.service.ts        dahira courant (signal), chargé selon le host
    │   │   └── theme.initializer.ts     applique les tokens du dahira sur :root
    │   ├── data/
    │   │   ├── event.service.ts
    │   │   ├── album.service.ts
    │   │   ├── board.service.ts
    │   │   └── content.service.ts       textes de pages, lignée, histoire
    │   ├── models/                      interfaces (voir §5)
    │   └── utils/
    │       ├── whatsapp.ts              buildWaLink()
    │       └── dates.ts                 format FR, compte à rebours
    ├── layout/
    │   └── public-shell/                topbar + <router-outlet> + footer + dock-nav
    ├── shared/ui/
    │   ├── medallion/
    │   ├── pattern-bg/
    │   ├── dark-hero/
    │   ├── event-ticket/
    │   ├── countdown-ring/
    │   ├── timeline/
    │   ├── arch-photo/
    │   ├── album-card/
    │   ├── member-card/
    │   ├── wa-button/
    │   ├── copy-number/
    │   ├── notify-optin/
    │   ├── section-heading/
    │   ├── dock-nav/
    │   └── site-footer/
    └── features/
        ├── home/            home.page.ts
        ├── about/           about.page.ts + guide/guide.page.ts
        ├── agenda/          agenda.page.ts + event.page.ts
        ├── gallery/         gallery.page.ts + album.page.ts
        ├── join/            join.page.ts
        └── admin/           (phase 2, lazy)
```

---

## 3. Routes

```ts
export const routes: Routes = [
  {
    path: '',
    component: PublicShell,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.page'), title: 'Accueil' },
      { path: 'le-dahira', loadComponent: () => import('./features/about/about.page'), title: 'Qui sommes-nous' },
      { path: 'le-dahira/notre-guide', loadComponent: () => import('./features/about/guide/guide.page'), title: 'Notre guide' },
      { path: 'agenda', loadComponent: () => import('./features/agenda/agenda.page'), title: 'Agenda' },
      { path: 'agenda/:slug', loadComponent: () => import('./features/agenda/event.page') },
      { path: 'galerie', loadComponent: () => import('./features/gallery/gallery.page'), title: 'Galerie' },
      { path: 'galerie/:album', loadComponent: () => import('./features/gallery/album.page') },
      { path: 'rejoindre', loadComponent: () => import('./features/join/join.page'), title: 'Rejoindre' },
    ],
  },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes') },
  { path: '**', redirectTo: '' },
];
```

Titre de page : `TitleStrategy` personnalisée → `"<titre> · <nom du dahira>"`.

---

## 4. Design tokens (`_variables.scss`)

Valeurs issues des maquettes. `ThemeInitializer` les surcharge par dahira.

```scss
:root {
  /* Couleurs */
  --color-primary: #0A3A1B;          // vert profond : hero, cartes sombres, texte
  --color-primary-deep: #062711;     // footer, dock
  --color-primary-mid: #0F5C27;      // aplats photo, liens hover
  --color-brand: #1BB13E;            // vert du logo : bouton WhatsApp, actif dock
  --color-on-brand: #062711;         // texte sur vert vif
  --color-gold: #E2B743;             // aplats or (soutien, badges, chips actifs)
  --color-gold-line: #D9B24C;        // filets, anneau, motif étoilé, fils de frise
  --color-gold-text: #8A6A12;        // or lisible sur ivoire (surtitres)
  --color-accent-blue: #2C3BA8;      // aplats vidéo (bleu du boubou)
  --color-surface: #F4EFE3;          // ivoire (fond)
  --color-surface-card: #FFFFFF;
  --color-surface-muted: #EFE8D6;
  --color-border: #D8CDB2;
  --color-text-primary: #0A3A1B;
  --color-text-secondary: #3D5444;
  --color-text-muted: #6A6152;
  --color-text-on-dark: #F4EFE3;
  --color-text-on-dark-soft: #CFE0D3;

  /* Typo */
  --font-display: 'Young Serif', Georgia, serif;          // 1 seule graisse (400)
  --font-body: 'Atkinson Hyperlegible Next', system-ui, sans-serif;
  --font-arabic: 'Aref Ruqaa', serif;

  --fs-hero: 46px;      // h1 pages
  --fs-hero-xl: 54px;   // h1 Agenda / Galerie
  --fs-h2: 26px;
  --fs-h2-lg: 30px;
  --fs-title: 20px;
  --fs-body-lg: 17px;
  --fs-body: 16px;
  --fs-small: 14px;
  --fs-overline: 13px;  // surtitres en capitales, letter-spacing .16em
  --lh-tight: 0.96;
  --lh-body: 1.5;

  /* Espacements (base 4) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px; --space-11: 44px;

  /* Rayons */
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-card: 28px;
  --radius-xl: 36px;           // raccord hero → contenu
  --radius-pill: 999px;
  --radius-arch: 999px 999px 20px 20px;

  /* Ombres / transitions */
  --shadow-float: 0 18px 40px rgb(10 58 27 / 0.12);
  --shadow-dock: 0 10px 30px rgb(6 39 17 / 0.35);
  --transition-base: 0.15s ease;

  /* Focus */
  --focus-ring-width: 3px;
  --focus-ring-color: #E2B743;
  --focus-ring-offset: 2px;

  /* Tailles tactiles */
  --tap-min: 44px;
  --btn-h: 56px;
  --btn-h-lg: 62px;
}
```

### Nouveaux mixins (`_mixins.scss`)

```scss
// Motif étoilé or en filigrane (8 branches), à poser sur un fond sombre
@mixin pattern-star($opacity: 0.22) {
  position: relative;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: $opacity;
    background-image: url('/assets/patterns/star-gold.svg'); // tuile 48×48
    background-size: 48px 48px;
    pointer-events: none;
  }
}

// Cadre en arche (photos)
@mixin arch($radius-bottom: 20px) {
  border-radius: 999px 999px $radius-bottom $radius-bottom;
  overflow: hidden;
}

// Hero sombre + raccord arrondi de la section suivante
@mixin dark-hero {
  @include pattern-star;
  background: var(--color-primary);
  color: var(--color-text-on-dark);
  padding-bottom: 76px;
}
@mixin overlap-sheet {
  position: relative;
  margin-top: -40px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  background: var(--color-surface);
}
```

Tuile `star-gold.svg` (48×48) :
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <path d="M24 7L41 24L24 41L7 24Z M12 12H36V36H12Z M24 0V7 M24 41V48 M0 24H7 M41 24H48"
        fill="none" stroke="#D9B24C" stroke-width="1"/>
</svg>
```

### Typographie
- Polices **auto-hébergées** (woff2, subset latin + latin-ext ; Aref Ruqaa subset arabe), `font-display: swap`.
- `h1, h2, h3 { font-synthesis: none; }` (Young Serif n'a qu'une graisse : ne jamais mettre `font-weight: 700` dessus).
- Surtitres : `font: 700 var(--fs-overline)/1 var(--font-body); letter-spacing: .16em; text-transform: uppercase;`

---

## 5. Modèles de données (`core/models`)

```ts
export interface Dahira {
  id: string;
  slug: string;                 // 'moutahabina'
  name: string;                 // 'Dahira Moutahabina Fillahi'
  shortName: string;            // 'MOUTAHABINA'
  nameArabic?: string;          // 'المتحابين في الله'
  nameMeaning?: string;         // « ceux qui s'aiment pour Dieu »
  motto: string;                // « S'aimer pour Dieu, servir ensemble. »
  ringText: string;             // texte de l'anneau du médaillon
  guideName: string;            // 'Serigne Mame Malick Sy'
  foundedYear: number;          // 1999
  foundedPlace: string;         // 'Yeumbeul'
  membersApprox?: number;       // 150 (exemple)
  logoUrl: string;
  theme: Partial<Record<ThemeToken, string>>;   // surcharges de tokens
  contact: { address: string; phone: string };
  join: JoinSettings;
  support?: SupportSettings;
}

export interface JoinSettings {
  mode: 'chat' | 'group';       // discussion avec un responsable ou lien de groupe/chaîne
  whatsappNumber: string;       // '221770000000' (format international sans +)
  prefilledMessage: string;
  groupInviteUrl?: string;
  callNumber?: string;
}

export interface SupportSettings {
  text: string;
  wave?: string;                // '77 000 00 00'
  orangeMoney?: string;
  blessing?: string;            // « Qu'Allah vous le rende. »
}

export interface DahiraEvent {
  id: string;
  slug: string;
  title: string;
  startsAt: string;             // ISO
  endsAt?: string;
  place: string;
  mapUrl?: string;
  posterUrl?: string;
  description?: string;
  isMajor?: boolean;            // badge « Grand événement »
  albumSlug?: string;           // lien vers l'album une fois passé
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  date: string;
  place?: string;
  coverUrl?: string;
  kind: 'photos' | 'video';
  count?: number;               // nb de photos
  videoUrl?: string;            // YouTube / Facebook
  durationMin?: number;
  photos?: { url: string; alt: string }[];
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  order: number;
}

export interface HistoryStep { year: string; title: string; text: string; highlight?: boolean }

export interface LineageStep {
  relation: string;             // 'Arrière-grand-père', 'Grand-père', 'Père', 'Notre guide'
  name: string;
  alias?: string;               // « Maodo », « Borom Daaraji »…
  years?: string;               // '1885 – 1957'
  text: string;
  highlight?: boolean;
}
```

---

## 6. Utilitaires

```ts
// core/utils/whatsapp.ts
export function buildWaLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function buildWaShare(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}
```

```ts
// core/utils/dates.ts
export const daysUntil = (iso: string, now = new Date()) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000));

export const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(new Date(iso));        // '05'
export const fmtMonthShort = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(iso)).toUpperCase(); // 'DÉC.'
export const fmtWeekday = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date(iso));
```

Tests unitaires obligatoires sur ces deux fichiers.

---

## 7. Multi-tenant et thème

```ts
// core/tenant/tenant.service.ts (idée)
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _dahira = signal<Dahira | null>(null);
  readonly dahira = this._dahira.asReadonly();

  // slug déduit du host : 'moutahabina.dahiraconnect.sn' → 'moutahabina'
  // en local : ?tenant=moutahabina ou environment.defaultTenant
  load(host: string): Promise<void> { /* fetch mock/tenant.json puis Supabase */ }
}
```

- `provideAppInitializer(() => inject(TenantService).load(...))` puis `ThemeInitializer` écrit les surcharges sur `document.documentElement.style.setProperty('--color-…', …)` (côté SSR : injecter un `<style>:root{…}</style>` dans le `<head>`).
- Le logo, le nom, les numéros, l'anneau : **toujours** lus depuis `TenantService`, jamais en dur.

---

## 8. Composants partagés (spécifications)

### `app-medallion`
Logo dans un anneau de texte doré qui tourne.
```ts
logoUrl = input.required<string>();
alt = input.required<string>();
text = input.required<string>();   // 'S'AIMER POUR DIEU • SERVIR ENSEMBLE • DEPUIS 1999 •'
size = input<number>(300);         // 300 accueil, 240 pages, 260 guide
spin = input<boolean>(true);
```
- SVG `viewBox="0 0 size size"`, `<path>` circulaire (rayon = size/2 − 16) + `<textPath>` avec `textLength` ≈ circonférence − 10 et `lengthAdjust="spacing"`.
- Cercle pointillé `stroke-dasharray="2 6"` au rayon size/2 − 4.
- Logo centré à 70 % de la taille, **jamais recadré ni déformé**.
- Rotation 40 s linéaire infinie ; `@media (prefers-reduced-motion: reduce) { animation: none; }`.
- Le SVG de l'anneau est `aria-hidden="true"` ; l'`<img>` porte l'`alt`.

### `app-dark-hero`
Conteneur hero vert profond + motif étoilé + topbar (logo 40 px + nom court + bouton « Rappels »).
Slot `<ng-content>` pour surtitre, h1, texte, CTA. La section suivante utilise `m.overlap-sheet`.

### `app-event-ticket`
Carte « billet » du prochain rendez-vous (accueil).
```ts
event = input.required<DahiraEvent>();
```
- Gauche : bloc or 112 px, jour en `--font-display` 64 px, mois en capitales, jour de semaine. Deux demi-cercles ivoire (22 px) pour la perforation.
- Droite : séparateur pointillé, chip sombre « Dans N jours », titre 21 px, heure · lieu.
- Toute la carte = `<a [routerLink]="['/agenda', event.slug]">`.

### `app-countdown-ring`
Cercle de progression (92 px) avec « 14 / jours » au centre. `days = input.required<number>()`, `maxDays = input(30)`.

### `app-timeline`
Frise verticale à fil doré, deux variantes :
```ts
variant = input<'history' | 'lineage' | 'agenda'>('history');
```
- `history` : point or 16 px + année en display 52 px + titre + texte ; dernière étape point vert.
- `lineage` : médaillon blanc 72 px (relation : « Grand-père »…) + carte ; dernière étape carte sombre, médaillon or.
- `agenda` : médaillon date 64 px (jour + mois) + titre + heure · lieu ; « Grand événement » = badge or.

### `app-arch-photo`
```ts
src = input<string>(); alt = input<string>('');
fallback = input<'green'|'gold'|'blue'|'sage'>('green');   // aplat + motif si pas d'image
badge = input<string>('');                                  // '64 photos'
```
`NgOptimizedImage`, `@include m.arch`.

### `app-album-card`
Grande (arche 350×440) ou petite (168×230, grille 2 colonnes décalée de 36 px). Bouton « Partager l'album » → `buildWaShare`.

### `app-member-card`
Carte 196 px dans un carrousel horizontal (`scroll-snap-type: x mandatory`) : photo en arche 220 px (silhouette si absente), rôle en surtitre or, nom.

### `app-wa-button`
```ts
label = input<string>('Rejoindre sur WhatsApp');
variant = input<'brand' | 'dark' | 'light'>('brand');   // vert vif / vert profond / ivoire
size = input<'md' | 'lg'>('md');                         // 56 / 62 px
```
Lien `<a target="_blank" rel="noopener">` vers `buildWaLink(join.whatsappNumber, join.prefilledMessage)` (ou `groupInviteUrl` si `mode === 'group'`).

### `app-copy-number`
Ligne « Wave · 77 000 00 00 · [Copier] » ; `navigator.clipboard.writeText` + retour « Copié ✓ » 2 s (`aria-live="polite"`).

### `app-notify-optin`
Carte sombre avec cercles concentriques : bouton « Activer les rappels » (notifications web, V1 : maquette, V2 : branché) + lien « Plutôt par e-mail » qui déplie un champ e-mail unique.

### `app-dock-nav`
Barre flottante en pilule (`position: fixed; bottom: 16px; inset-inline: 14px; height: 72px`), 5 entrées : Accueil · Le dahira · **Rejoindre** (bouton rond 62 px vert vif surélevé de 30 px, bordure ivoire 4 px) · Agenda · Galerie.
- `routerLinkActive` → vert vif + `aria-current="page"`.
- `padding-bottom: env(safe-area-inset-bottom)`.
- Le contenu des pages réserve `padding-bottom: 132px` dans le footer.

### `app-site-footer`
Fond `--color-primary-deep`, nom en arabe en filigrane (opacité .06), nom, adresse, téléphone, « Propulsé par DahiraConnect ».

---

## 9. Pages (contenu de la maquette)

### Accueil `/`
1. **Hero sombre** : topbar · médaillon 300 px · nom arabe (Aref Ruqaa 30 px or) · h1 « S'aimer pour Dieu, servir ensemble. » (44 px) · phrase guide · CTA `app-wa-button` « Nous rejoindre » + bouton rond flèche → `/le-dahira`.
2. **Prochain rendez-vous** (`overlap-sheet`) : h2 + lien « Agenda → » + `app-event-ticket`.
3. **Nos moments** : carrousel horizontal de 3 `app-arch-photo` 220×290 + légende.
4. **Chiffres** : 3 colonnes séparées par filets : `1999` année de création · `150` membres environ · `27 ans` d'histoire (calculé : année courante − foundedYear).
5. **À propos du dahira** : surtitre, h2 « Apprendre, prier et servir, ensemble. », texte fondation 1999 + passage de relais 2012, boutons « Notre histoire → » et « Notre guide → ».
6. **Ne ratez plus aucun rendez-vous** : `app-notify-optin`.
7. **Soutenir le dahira** : carte or, 2 × `app-copy-number`, bénédiction.
8. Footer + dock.

### Qui sommes-nous `/le-dahira`
1. Hero : surtitre · h1 « Une famille née à Yeumbeul en 1999. » · nom arabe · sens du nom.
2. **Notre histoire** : `app-timeline variant="history"` (1999 Naissance à Yeumbeul · 2012 Une guidance qui continue · Aujourd'hui Une grande famille).
3. **Carte guide** sombre : médaillon 104 px, « Notre guide », nom, lien « Sa lignée → ».
4. **Le bureau** : carrousel `app-member-card` + mention « Faites défiler → ».
5. CTA or « Envie de nous rejoindre ? ».

### Notre guide `/le-dahira/notre-guide`
1. Hero : lien retour, surtitre, médaillon 260 px, h1 « Serigne Mame Malick Sy », filiation, encadré pointillé (bio à fournir).
2. **Sa lignée** : `app-timeline variant="lineage"` — Seydi El Hadji Malick Sy « Maodo » (†1922) → Serigne Babacar Sy (1885–1957) → Serigne Mansour Sy « Borom Daaraji » (1925–2012, guide du dahira dès 1999) → Serigne Mame Malick Sy (guide depuis 2012).
3. **Le saviez-vous ?** (carte or) : Serigne Babacar Sy a initié les premiers dahiras.
4. CTA + mention des sources (Le Soleil, Seneweb, Senego) — **textes à valider par le bureau**.

### Agenda `/agenda`
1. Hero : h1 « Agenda » 54 px + chips de mois (actif = or).
2. **Carte flottante** (`margin-top: -40px`, ombre) : grand jour 76 px + `app-countdown-ring` + titre + mini-carte → itinéraire + « Partager » (WhatsApp) + « Me rappeler ».
3. **Ensuite** : `app-timeline variant="agenda"`.
4. **C'était hier** : événement passé → album.

### Galerie `/galerie`
1. Hero : h1 « Nos moments ensemble » + filtres Tout / Photos / Vidéos (`aria-pressed`).
2. Grand album en arche + « Partager l'album ».
3. Grille 2 colonnes décalée.
4. Carte vidéo bleue avec bouton lecture.
5. CTA sombre « Vivez ces moments avec nous ».
`@defer (on viewport)` sur la grille et la vidéo.

### Rejoindre `/rejoindre`
1. Hero : médaillon 240 px (anneau « BIENVENUE • … »), h1 « Rejoignez la famille. », texte, `app-wa-button size="lg"`, lien « Ou appeler le responsable » (`tel:`).
2. **Le message est déjà écrit** : bulle style WhatsApp (fond `#E7DFD3`, bulle `#D9FDD3`).
3. **Comment ça se passe** : 3 étapes numérotées reliées par un fil doré.

---

## 10. Données de démo (`assets/mock/tenant.json`, extrait)

```json
{
  "slug": "moutahabina",
  "name": "Dahira Moutahabina Fillahi",
  "shortName": "MOUTAHABINA",
  "nameArabic": "المتحابين في الله",
  "nameMeaning": "ceux qui s'aiment pour Dieu",
  "motto": "S'aimer pour Dieu, servir ensemble.",
  "ringText": "S'AIMER POUR DIEU • SERVIR ENSEMBLE • DEPUIS 1999 •",
  "guideName": "Serigne Mame Malick Sy",
  "foundedYear": 1999,
  "foundedPlace": "Yeumbeul",
  "membersApprox": 150,
  "logoUrl": "/assets/tenants/moutahabina/logo.webp",
  "contact": { "address": "Yeumbeul, Dakar", "phone": "+221 77 000 00 00" },
  "join": {
    "mode": "chat",
    "whatsappNumber": "221770000000",
    "prefilledMessage": "Assalamou aleykoum, je souhaite rejoindre le Dahira Moutahabina Fillahi.",
    "callNumber": "+221770000000"
  },
  "support": {
    "text": "Votre soutien finance nos activités et nos actions sociales.",
    "wave": "77 000 00 00",
    "orangeMoney": "78 000 00 00",
    "blessing": "Qu'Allah vous le rende."
  }
}
```

> Numéros, noms du bureau, membres, dates et lieux d'événements = **exemples** à remplacer.

---

## 11. Performance et accessibilité

- Page d'accueil < 1 Mo, LCP < 2.5 s en 3G rapide.
- Images : WebP/AVIF, `NgOptimizedImage`, `priority` sur le médaillon du hero uniquement.
- Polices : woff2 subset, `preload` de Young Serif et Atkinson regular.
- `@defer` pour carrousels et galerie.
- Pas de bibliothèque d'animation : CSS uniquement, respecter `prefers-reduced-motion`.
- Lighthouse cible : Perf ≥ 90, Accessibilité ≥ 95, SEO ≥ 95.
- Balises `lang="fr"`, nom arabe en `lang="ar" dir="rtl"`.
- Métadonnées Open Graph par page (aperçu soigné quand on partage le lien sur WhatsApp).

---

## 12. Plan de travail

1. **Socle** : projet Angular + SSR, `styles/` (tokens, typo, mixins), polices, tuile SVG.
2. **Coquille** : `PublicShell`, `app-dark-hero`, `app-dock-nav`, `app-site-footer`, routes.
3. **Données** : modèles, mocks, `TenantService`, services de données, utilitaires + tests.
4. **Composants signature** : medallion, event-ticket, countdown-ring, timeline, arch-photo, member-card, wa-button, copy-number, notify-optin.
5. **Pages** : Accueil → Rejoindre → Qui sommes-nous → Guide → Agenda → Galerie.
6. **Recette** : test sur Android d'entrée de gamme en 3G, Lighthouse, relecture des textes religieux par le bureau.
7. **Ensuite** : Supabase (multi-tenant), back-office mobile, notifications/newsletter, langues AR/EN.

---

## 13. Questions ouvertes

- [ ] Version d'Angular exacte ?
- [ ] `_mixins.scss` existant à réutiliser (flex-row, card, btn-base, badge, truncate, skeleton-base) ?
- [ ] Préfixe des composants : `app-` ?
- [ ] « Rejoindre » : discussion avec un responsable ou lien direct vers le groupe / la chaîne ?
- [ ] Bio de Serigne Mame Malick Sy, vrais noms et photos du bureau, nombre réel de membres, adresse du siège.
- [ ] Réservation du domaine `dahiraconnect.sn`.
