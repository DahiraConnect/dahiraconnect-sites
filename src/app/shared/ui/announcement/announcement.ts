import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
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
          @if (a.audioUrl || canSpeak() || a.linkUrl) {
            <div class="ann__actions">
            @if (a.audioUrl || canSpeak()) {
              <button type="button" class="ann__listen" data-track="ecoute_annonce" (click)="toggle(a)"
                [attr.aria-pressed]="playing()">
                <i class="ph-fill" [class.ph-play]="!playing()" [class.ph-pause]="playing()" aria-hidden="true"></i>
                {{ playing() ? 'Pause' : 'Écouter' }}
                @if (a.audioUrl && a.audioSeconds) {
                  <span class="ann__dur">{{ duration(a.audioSeconds) }}</span>
                }
              </button>
              @if (a.audioUrl) {
                <audio #player [src]="a.audioUrl" preload="none" (ended)="playing.set(false)" (pause)="playing.set(false)" (play)="playing.set(true)"></audio>
              }
            }
            @if (a.linkUrl) {
              @if (a.linkUrl.startsWith('/')) {
                <a class="ann__link" [routerLink]="a.linkUrl">{{ a.linkLabel || 'Voir le détail' }} <span aria-hidden="true">→</span></a>
              } @else {
                <a class="ann__link" [href]="a.linkUrl" target="_blank" rel="noopener">{{ a.linkLabel || 'Voir le détail' }} <span aria-hidden="true">→</span></a>
              }
            }
            </div>
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
  private readonly player = viewChild<ElementRef<HTMLAudioElement>>('player');
  protected readonly playing = signal(false);
  /** Lecture à voix haute du texte : seulement dans le navigateur, si le téléphone sait le faire */
  protected readonly canSpeak = signal(false);

  constructor() {
    afterNextRender(() => this.canSpeak.set('speechSynthesis' in window));
    inject(DestroyRef).onDestroy(() => {
      if (typeof speechSynthesis !== 'undefined' && this.speaking) speechSynthesis.cancel();
    });
  }

  private speaking = false;

  protected duration(s: number): string {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  protected toggle(a: Announcement): void {
    const audio = this.player()?.nativeElement;
    if (audio) {
      if (audio.paused) void audio.play();
      else audio.pause();
      return;
    }
    // Pas de vocal : le téléphone lit le texte en français
    if (this.playing()) {
      speechSynthesis.cancel();
      this.playing.set(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(a.text);
    u.lang = 'fr-FR';
    u.rate = 0.95;
    u.onend = u.onerror = () => {
      this.speaking = false;
      this.playing.set(false);
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    this.speaking = true;
    this.playing.set(true);
  }
  protected readonly visible = computed(() => {
    const a = this.announcement();
    return isAnnouncementVisible(a) ? a : null;
  });
}
