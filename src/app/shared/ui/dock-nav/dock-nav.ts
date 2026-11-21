import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

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
  private readonly router = inject(Router);

  /** Pendant une partie de quiz, le dock est masqué (rien à toucher par erreur) */
  protected readonly hidden = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => /^\/quiz\/[^/?#]+/.test(url)),
    ),
    { initialValue: false },
  );

  protected readonly items: DockItem[] = [
    { path: '/', label: 'Accueil', icon: 'ph-house', exact: true },
    { path: '/le-dahira', label: 'Le dahira', icon: 'ph-users-three' },
    { path: '/rejoindre', label: 'Rejoindre', icon: 'ph-whatsapp-logo', primary: true },
    { path: '/agenda', label: 'Agenda', icon: 'ph-calendar-blank' },
    { path: '/galerie', label: 'Galerie', icon: 'ph-images' },
  ];
}
