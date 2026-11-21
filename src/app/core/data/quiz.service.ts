import { Injectable, computed, inject } from '@angular/core';
import { QuizLang, QuizTheme } from '../models';
import { TenantService } from '../tenant/tenant.service';

/** Quiz sans compte : thèmes et meilleur score gardé sur le téléphone. */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly tenant = inject(TenantService);

  readonly quiz = computed(() => this.tenant.bundle().quiz);
  readonly themes = computed(() => (this.quiz()?.themes ?? []).filter((t) => t.questions.length));

  byId(id: string): QuizTheme | undefined {
    return this.themes().find((t) => t.id === id);
  }

  /** Meilleur score enregistré (stockage local, peut être indisponible : navigation privée…) */
  bestScore(themeId: string): number | null {
    try {
      const value = localStorage.getItem(this.key(themeId));
      return value === null ? null : Number(value);
    } catch {
      return null;
    }
  }

  saveScore(themeId: string, score: number): void {
    try {
      const best = this.bestScore(themeId);
      if (best === null || score > best) localStorage.setItem(this.key(themeId), String(score));
    } catch {
      /* pas de stockage : le score n'est simplement pas mémorisé */
    }
  }

  /** Langue préférée pour les thèmes disponibles en arabe */
  preferredLang(): QuizLang {
    try {
      return localStorage.getItem('dc-quiz-lang') === 'ar' ? 'ar' : 'fr';
    } catch {
      return 'fr';
    }
  }

  setPreferredLang(lang: QuizLang): void {
    try {
      localStorage.setItem('dc-quiz-lang', lang);
    } catch {
      /* pas de stockage : le choix vaut pour cette partie */
    }
  }

  private key(themeId: string): string {
    return `dc-quiz-${this.tenant.dahira().slug}-${themeId}`;
  }
}
