import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface DockItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  primary?: boolean;
}

/** Barre de navigation flottante en pilule ; « Rejoindre » surélevé au centre. */
@Component({
  selector: 'app-dock-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dock-nav.html',
  styleUrl: './dock-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockNav {
  protected readonly items: DockItem[] = [
    { path: '/', label: 'Accueil', icon: 'ph-house', exact: true },
    { path: '/le-dahira', label: 'Le dahira', icon: 'ph-users-three' },
    { path: '/rejoindre', label: 'Rejoindre', icon: 'ph-whatsapp-logo', primary: true },
    { path: '/agenda', label: 'Agenda', icon: 'ph-calendar-blank' },
    { path: '/galerie', label: 'Galerie', icon: 'ph-images' },
  ];
}
