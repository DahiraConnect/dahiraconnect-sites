import { Routes } from '@angular/router';
import {
  eventExistsGuard,
  eventSeoResolver,
  eventTitleResolver,
  homeSeoResolver,
} from './features/agenda/agenda.resolvers';
import { albumExistsGuard, albumSeoResolver, albumTitleResolver } from './features/gallery/gallery.resolvers';
import { quizExistsGuard, quizSeoResolver, quizTitleResolver } from './features/quiz/quiz.resolvers';

export const routes: Routes = [
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes') },
  {
    path: '',
    loadComponent: () => import('./layout/public-shell/public-shell'),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page'),
        title: 'Accueil',
        resolve: { seo: homeSeoResolver },
      },
      {
        path: 'le-dahira',
        loadComponent: () => import('./features/about/about.page'),
        title: 'Qui sommes-nous',
        data: { seo: { description: 'Notre histoire, notre guide et le bureau du dahira.' } },
      },
      {
        path: 'le-dahira/notre-guide',
        loadComponent: () => import('./features/about/guide/guide.page'),
        title: 'Notre guide',
        data: { seo: { description: 'Notre guide et sa lignée.' } },
      },
      {
        path: 'le-dahira/bureau',
        loadComponent: () => import('./features/about/board/board.page'),
        title: 'Le bureau',
        data: { seo: { description: 'Le bureau du dahira et ses commissions.' } },
      },
      {
        path: 'le-dahira/charte',
        loadComponent: () => import('./features/about/charter/charter.page'),
        title: 'Notre charte',
        data: {
          seo: { description: 'Les engagements des membres et le déroulement d’un dahira.' },
        },
      },
      {
        path: 'agenda',
        loadComponent: () => import('./features/agenda/agenda.page'),
        title: 'Agenda',
        data: { seo: { description: 'Les prochains rendez-vous du dahira.' } },
      },
      {
        path: 'agenda/:slug',
        loadComponent: () => import('./features/agenda/event.page'),
        canActivate: [eventExistsGuard],
        title: eventTitleResolver,
        resolve: { seo: eventSeoResolver },
      },
      {
        path: 'galerie',
        loadComponent: () => import('./features/gallery/gallery.page'),
        title: 'Galerie',
        data: { seo: { description: 'Photos et vidéos des moments du dahira.' } },
      },
      {
        path: 'galerie/:album',
        loadComponent: () => import('./features/gallery/album.page'),
        canActivate: [albumExistsGuard],
        title: albumTitleResolver,
        resolve: { seo: albumSeoResolver },
      },
      {
        path: 'quiz',
        loadComponent: () => import('./features/quiz/quiz.page'),
        title: 'Quiz',
        data: { seo: { description: 'Testez vos connaissances sur le dahira, sa lignée et sa charte.' } },
      },
      {
        path: 'quiz/:theme',
        loadComponent: () => import('./features/quiz/quiz-play.page'),
        canActivate: [quizExistsGuard],
        title: quizTitleResolver,
        resolve: { seo: quizSeoResolver },
      },
      {
        path: 'rejoindre',
        loadComponent: () => import('./features/join/join.page'),
        title: 'Rejoindre',
        data: { seo: { description: 'Rejoignez le dahira en un message WhatsApp.' } },
      },
      {
        path: '404',
        loadComponent: () => import('./features/not-found/not-found.page'),
        title: 'Page introuvable',
      },
      {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found.page'),
        title: 'Page introuvable',
      },
    ],
  },
];
