import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SUPABASE } from '../../../../environments/supabase';

interface StoredSession {
  user?: { email?: string; user_metadata?: { name?: string } };
}

/** Clé de session de Supabase dans le navigateur : sb-<projet>-auth-token */
export function sessionStorageKey(url: string): string {
  return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
}

/**
 * Pastille « responsable connecté » dans l'en-tête du site public.
 * Lit seulement la session déjà enregistrée sur l'appareil (aucun client Supabase chargé) ;
 * invisible pour les visiteurs.
 */
@Component({
  selector: 'app-admin-chip',
  imports: [RouterLink],
  template: `
    @if (name(); as n) {
      <button type="button" class="chip" (click)="open.set(!open())" [attr.aria-expanded]="open()"
        aria-controls="admin-chip-menu" [attr.aria-label]="'Espace responsables : ' + n">
        <span class="chip__avatar" aria-hidden="true">{{ n.charAt(0).toUpperCase() }}</span>
      </button>
      @if (open()) {
        <div class="chip__menu" id="admin-chip-menu">
          <p class="chip__who">Connecté : <strong>{{ n }}</strong></p>
          <a class="chip__item" routerLink="/admin"><i class="ph ph-squares-four" aria-hidden="true"></i> Tableau de bord</a>
          <a class="chip__item" routerLink="/admin/annonce"><i class="ph ph-megaphone-simple" aria-hidden="true"></i> Annonce</a>
          <a class="chip__item" routerLink="/admin/agenda/nouveau"><i class="ph ph-calendar-plus" aria-hidden="true"></i> Nouvel événement</a>
          <a class="chip__item chip__item--out" routerLink="/admin/deconnexion"><i class="ph ph-sign-out" aria-hidden="true"></i> Se déconnecter</a>
        </div>
      }
    }
  `,
  styleUrl: './admin-chip.scss',
  host: {
    '(document:click)': 'onDocClick($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChip {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly name = signal<string | null>(null);
  protected readonly open = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!SUPABASE.url) return;
      try {
        const raw = localStorage.getItem(sessionStorageKey(SUPABASE.url));
        const session = raw ? (JSON.parse(raw) as StoredSession) : null;
        const user = session?.user;
        if (user?.email) this.name.set(user.user_metadata?.name?.trim() || user.email.split('@')[0]);
      } catch {
        /* stockage indisponible : on n'affiche rien */
      }
    });
  }

  protected onDocClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
