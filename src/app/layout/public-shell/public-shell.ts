import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { DockNav } from '../../shared/ui/dock-nav/dock-nav';
import { InstallBanner } from '../../shared/ui/install-banner/install-banner';
import { SiteFooter } from '../../shared/ui/site-footer/site-footer';
import { SiteHeader } from '../../shared/ui/site-header/site-header';

/**
 * Coquille publique : barre de navigation (ordinateur) ou dock (mobile),
 * page, footer, et barre de chargement pendant les navigations lentes (3G).
 */
@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, SiteHeader, SiteFooter, DockNav, InstallBanner],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PublicShell {
  protected readonly loading = signal(false);

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Afficher la barre seulement si la navigation dure (évite le clignotement)
        timer = setTimeout(() => this.loading.set(true), 120);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        clearTimeout(timer);
        this.loading.set(false);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(timer);
      sub.unsubscribe();
    });
  }
}
