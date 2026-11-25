import { Injectable, computed, inject } from '@angular/core';
import { LessonLang, QuizLang, QuizTheme, hasLesson, hasParts, hasQuiz } from '../models';
import { TenantService } from '../tenant/tenant.service';

/** Rubrique « Apprendre », sans compte : thèmes (leçon et/ou quiz), meilleur score gardé sur le téléphone. */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly tenant = inject(TenantService);

  readonly quiz = computed(() => this.tenant.bundle().quiz);
  /** Tous les thèmes ouvrables : quiz, leçon, ou groupe de thèmes */
  readonly themes = computed(() => {
    const all = (this.quiz()?.themes ?? []).filter((t) => hasQuiz(t) || hasLesson(t));
    const ids = new Set(all.map((t) => t.id));
    const groups = (this.quiz()?.themes ?? [])
      .filter(hasParts)
      .map((g) => ({ ...g, parts: g.parts!.filter((id) => ids.has(id)) }))
      .filter(hasParts);
    const order = (this.quiz()?.themes ?? []).map((t) => t.id);
    return [...all, ...groups].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  });

  /** Thèmes de la liste principale : ceux qui ne sont pas dans un groupe */
  readonly topThemes = computed(() => {
    const inGroup = new Set(this.themes().flatMap((t) => t.parts ?? []));
    return this.themes().filter((t) => !inGroup.has(t.id));
  });

  byId(id: string): QuizTheme | undefined {
    return this.themes().find((t) => t.id === id);
  }

  /** Thèmes d'un groupe, dans l'ordre */
  partsOf(group: QuizTheme): QuizTheme[] {
    return (group.parts ?? []).map((id) => this.byId(id)).filter((t): t is QuizTheme => !!t);
  }

  /** Groupe qui contient ce thème */
  parentOf(id: string): QuizTheme | undefined {
    return this.themes().find((t) => t.parts?.includes(id));
  }

  /** Groupe de thèmes */
  withParts(id: string): QuizTheme | undefined {
    const theme = this.byId(id);
    return theme && hasParts(theme) ? theme : undefined;
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
