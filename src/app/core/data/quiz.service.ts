import { Injectable, computed, inject } from '@angular/core';
import { LessonLang, QuizLang, QuizTheme, hasLesson, hasQuiz } from '../models';
import { TenantService } from '../tenant/tenant.service';

const LANG_KEY = 'dc-langue';

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

  /** Leçon écoutée jusqu'au bout (gardé sur le téléphone) */
  lessonDone(themeId: string): boolean {
    try {
      return localStorage.getItem(`${this.key(themeId)}-lecon`) === '1';
    } catch {
      return false;
    }
  }

  markLessonDone(themeId: string): void {
    try {
      localStorage.setItem(`${this.key(themeId)}-lecon`, '1');
    } catch {
      /* pas de stockage : rien n'est mémorisé */
    }
  }

  /** Carte où l'on s'est arrêté (0 = début) */
  lessonPosition(themeId: string): number {
    try {
      return Number(localStorage.getItem(`${this.key(themeId)}-lecon-pos`) ?? 0) || 0;
    } catch {
      return 0;
    }
  }

  saveLessonPosition(themeId: string, index: number): void {
    try {
      localStorage.setItem(`${this.key(themeId)}-lecon-pos`, String(index));
    } catch {
      /* pas de stockage : on recommencera au début */
    }
  }

  /**
   * Langue choisie pour apprendre (leçons et quiz), une seule pour toute la rubrique.
   * null : jamais choisie (on la demande à la première visite).
   * Reprend les anciens réglages séparés du quiz et des leçons.
   */
  language(): LessonLang | null {
    try {
      const value =
        localStorage.getItem(LANG_KEY) ?? localStorage.getItem('dc-lecon-lang') ?? localStorage.getItem('dc-quiz-lang');
      return value === 'fr' || value === 'ar' || value === 'wo' ? value : null;
    } catch {
      return null;
    }
  }

  setLanguage(lang: LessonLang): void {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* pas de stockage : le choix vaut pour cette visite */
    }
  }

  /** Langue du quiz (français ou arabe) */
  preferredLang(): QuizLang {
    return this.language() === 'ar' ? 'ar' : 'fr';
  }

  /** Langue des leçons (le wolof en plus) */
  preferredLessonLang(): LessonLang {
    return this.language() ?? 'fr';
  }

  private key(themeId: string): string {
    return `dc-quiz-${this.tenant.dahira().slug}-${themeId}`;
  }
}
