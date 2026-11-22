import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';

/** Accueil du back-office : quatre grandes tuiles, rien d'autre. */
@Component({
  selector: 'app-admin-home',
  imports: [RouterLink],
  templateUrl: './admin-home.page.html',
  styleUrl: './admin-home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminHomePage {
  protected readonly auth = inject(AdminAuth);
  protected readonly tiles = [
    { path: 'agenda', icon: 'ph-calendar-plus', title: 'Agenda', text: 'Ajouter ou modifier un événement' },
    { path: 'galerie', icon: 'ph-images', title: 'Galerie', text: 'Albums photos et vidéos' },
    { path: 'bureau', icon: 'ph-users-three', title: 'Bureau', text: 'Membres, postes et commissions' },
    { path: 'infos', icon: 'ph-gear-six', title: 'Infos du dahira', text: 'Numéros, adresse, réseaux, soutien' },
  ];
  protected readonly firstName = computed(() => this.auth.email().split('@')[0]);
}
