import { Routes } from '@angular/router';
import { adminGuard, guestGuard } from './core/admin.guard';

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
          { path: '', loadComponent: () => import('./home/admin-home.page'), title: 'Espace responsables' },
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
          { path: 'infos', loadComponent: () => import('./profile/admin-profile.page'), title: 'Infos du dahira' },
          { path: '**', redirectTo: '' },
        ],
      },
    ],
  },
];

export default ADMIN_ROUTES;
