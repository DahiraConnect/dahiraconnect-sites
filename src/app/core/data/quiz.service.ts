import { Injectable, computed, inject } from '@angular/core';
import { LessonLang, QuizLang, QuizTheme, hasLesson, hasQuiz } from '../models';
import { TenantService } from '../tenant/tenant.service';

/** Rubrique « Apprendre », sans compte : thèmes (leçon et/ou quiz), meilleur score gardé sur le téléphone. */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly tenant = inject(TenantService);

  readonly quiz = computed(() => this.tenant.bundle().quiz);
  readonly themes = computed(() => (this.quiz()?.themes ?? []).filter((t) => hasQuiz(t) || hasLesson(t)));

  byId(id: string): QuizTheme | undefined {
    return this.themes().find((t) => t.id === id);
  }

  /** Thème avec un quiz à jouer */
  withQuiz(id: string): QuizTheme | undefined {
    const theme = this.byId(id);
    return theme && hasQuiz(theme) ? theme : undefined;
  }

  /** Thème avec une leçon à écouter */
  withLesson(id: string): QuizTheme | undefined {
    const theme = this.byId(id);
    return theme && hasLesson(theme) ? theme : undefined;
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

  /** Langue préférée des leçons (le wolof en plus) */
  preferredLessonLang(): LessonLang {
    try {
      const value = localStorage.getItem('dc-lecon-lang');
      return value === 'ar' || value === 'wo' ? value : 'fr';
    } catch {
      return 'fr';
    }
  }

  setPreferredLessonLang(lang: LessonLang): void {
    try {
      localStorage.setItem('dc-lecon-lang', lang);
    } catch {
      /* pas de stockage : le choix vaut pour cette leçon */
    }
  }

  private key(themeId: string): string {
    return `dc-quiz-${this.tenant.dahira().slug}-${themeId}`;
  }
}
