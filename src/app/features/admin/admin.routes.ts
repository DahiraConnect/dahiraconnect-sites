import { Routes } from '@angular/router';
import { adminGuard, guestGuard } from './core/admin.guard';
import { ownerGuard } from './core/owner.guard';

/** Back-office de contenu (rendu dans le navigateur uniquement, chargé à la demande). */
const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/admin-shell'),
    children: [
      {
        path: 'connexion',
        canActivate: [guestGuard],
        loadComponent: () => import('./login/login.page'),
        title: 'Connexion',
      },
      {
        path: '',
        canActivateChild: [adminGuard],
        children: [
          { path: '', loadComponent: () => import('./home/admin-home.page'), title: 'Tableau de bord' },
          { path: 'agenda', loadComponent: () => import('./events/admin-events.page'), title: 'Agenda · Admin' },
          { path: 'agenda/nouveau', loadComponent: () => import('./events/admin-event-form.page'), title: 'Nouvel événement' },
          { path: 'agenda/:id', loadComponent: () => import('./events/admin-event-form.page'), title: 'Modifier un événement' },
          { path: 'galerie', loadComponent: () => import('./albums/admin-albums.page'), title: 'Galerie · Admin' },
          { path: 'galerie/nouveau', loadComponent: () => import('./albums/admin-album-form.page'), title: 'Nouvel album' },
          { path: 'galerie/:id', loadComponent: () => import('./albums/admin-album-form.page'), title: 'Modifier un album' },
          { path: 'bureau', loadComponent: () => import('./board/admin-board.page'), title: 'Bureau · Admin' },
          { path: 'bureau/personnes', loadComponent: () => import('./board/admin-people.page'), title: 'Personnes du bureau' },
          { path: 'bureau/executif', loadComponent: () => import('./board/admin-group.page'), title: 'Bureau exécutif' },
          { path: 'bureau/commission/:id', loadComponent: () => import('./board/admin-group.page'), title: 'Commission' },
          { path: 'parametres', canActivate: [ownerGuard], loadComponent: () => import('./profile/admin-profile.page'), title: 'Paramètres' },
          { path: 'infos', redirectTo: 'parametres' },
          { path: 'profil', loadComponent: () => import('./me/admin-me.page'), title: 'Mon profil' },
          { path: 'textes', loadComponent: () => import('./content/admin-content.page'), title: 'Textes du site' },
          { path: 'annonce', loadComponent: () => import('./announcement/admin-announcement.page'), title: 'Annonce' },
          { path: 'equipe', loadComponent: () => import('./team/admin-team.page'), title: 'Équipe' },
          { path: 'activite', loadComponent: () => import('./activity/admin-activity.page'), title: 'Journal d’activité' },
          { path: '**', redirectTo: '' },
        ],
      },
    ],
  },
];

export default ADMIN_ROUTES;
