import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Announcement } from '../../../core/models';

/** Une annonce est visible si elle est active, non vide et pas encore expirée (jour inclus, heure de Dakar = UTC). */
export function isAnnouncementVisible(a: Announcement | undefined, now = new Date()): a is Announcement {
  return !!a?.active && !!a.text.trim() && (!a.until || now.toISOString().slice(0, 10) <= a.until);
}

/** Bandeau d'annonce : une phrase, un lien facultatif. */
@Component({
  selector: 'app-announcement',
  imports: [RouterLink],
  template: `
    @if (visible(); as a) {
      <aside class="ann" [class.ann--important]="a.tone === 'important'" aria-label="Annonce">
        <i class="ph ph-megaphone-simple ann__icon" aria-hidden="true"></i>
        <div class="ann__body">
          @if (a.tone === 'important') {
            <span class="ann__over">Important</span>
          }
          <p class="ann__text">{{ a.text }}</p>
          @if (a.linkUrl) {
            @if (a.linkUrl.startsWith('/')) {
              <a class="ann__link" [routerLink]="a.linkUrl">{{ a.linkLabel || 'Voir le détail' }} <span aria-hidden="true">→</span></a>
            } @else {
              <a class="ann__link" [href]="a.linkUrl" target="_blank" rel="noopener">{{ a.linkLabel || 'Voir le détail' }} <span aria-hidden="true">→</span></a>
            }
          }
        </div>
      </aside>
    }
  `,
  styleUrl: './announcement.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementBanner {
  readonly announcement = input<Announcement | undefined>();
  protected readonly visible = computed(() => {
    const a = this.announcement();
    return isAnnouncementVisible(a) ? a : null;
  });
}
