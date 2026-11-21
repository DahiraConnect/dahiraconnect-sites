import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';

/** Adresse inconnue (ex. lien mal copié dans WhatsApp) : on explique et on propose des chemins. */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, DarkHero],
  template: `
    <app-dark-hero>
      <div class="hero">
        <h1 class="hero__title rise">Page introuvable</h1>
        <p class="hero__lead rise" style="--i: 1">
          Le lien est peut-être incomplet, ou la page a été déplacée.
        </p>
      </div>
    </app-dark-hero>
    <nav class="links container" aria-label="Pages principales">
      <a class="btn btn--dark" routerLink="/">Retour à l'accueil</a>
      <a class="link-more" routerLink="/agenda">Agenda&nbsp;<span aria-hidden="true">→</span></a>
      <a class="link-more" routerLink="/galerie">Galerie&nbsp;<span aria-hidden="true">→</span></a>
    </nav>
  `,
  styles: `
    @use 'styles/mixins' as m;
    .hero { display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-6) var(--gutter) 0; }
    .hero__title { @include m.display(var(--fs-hero), var(--lh-tight)); }
    .hero__lead { font-size: var(--fs-body-lg); color: var(--color-text-on-dark-soft); max-width: 40ch; }
    .links {
      display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3) var(--space-6);
      padding: var(--space-10) var(--gutter) 72px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFoundPage {
  constructor() {
    // Rendu serveur : vrai code 404 (moteurs de recherche, aperçus de liens)
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}
