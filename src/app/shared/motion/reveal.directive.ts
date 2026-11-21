import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Fait apparaître l'élément (fondu + montée) quand il entre dans l'écran.
 * - Rendu serveur : rien n'est masqué (contenu visible même sans JS).
 * - Déjà visible au chargement : pas d'animation (pas de clignotement).
 * - `prefers-reduced-motion` : désactivé.
 *
 * <section appReveal> · <li appReveal [appRevealDelay]="$index * 80">
 */
@Directive({
  selector: '[appReveal]',
  host: { '[style.--reveal-delay.ms]': 'appRevealDelay()' },
})
export class Reveal {
  readonly appRevealDelay = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (
        typeof IntersectionObserver === 'undefined' ||
        matchMedia('(prefers-reduced-motion: reduce)').matches ||
        el.getBoundingClientRect().top < innerHeight * 0.9
      ) {
        return;
      }
      el.classList.add('reveal-pending');
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.classList.add('reveal-in');
          el.classList.remove('reveal-pending');
          observer.disconnect();
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
