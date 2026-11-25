import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../core/data/quiz.service';
import { QuizTheme, hasArabic, hasLesson, hasQuiz } from '../../../core/models';
import { lessonLangs } from '../../../core/utils/lesson';
import { plural } from '../../../core/utils/plural';

/** Carte d'un thème : « Écouter » (vert) et « Jouer » (jaune). */
@Component({
  selector: 'app-theme-card',
  imports: [RouterLink],
  templateUrl: './theme-card.html',
  styleUrl: './theme-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeCard {
  private readonly quiz = inject(QuizService);

  readonly theme = input.required<QuizTheme>();

  protected readonly plural = plural;
  protected readonly lesson = computed(() => hasLesson(this.theme()));
  protected readonly game = computed(() => hasQuiz(this.theme()));
  /** Parties de la leçon (ex. les 23 chartes en 5 parties) */
  protected readonly chapters = computed(
    () => new Set((this.theme().lesson?.cards ?? []).flatMap((c) => (c.chapter ? [c.chapter] : []))).size,
  );
  /** Langues en plus du français, ex. « FR · عربي · Wolof » */
  protected readonly langs = computed(() => {
    const t = this.theme();
    const lesson = t.lesson && hasLesson(t) ? lessonLangs(t.lesson) : [];
    return { ar: lesson.includes('ar') || hasArabic(t), wo: lesson.includes('wo') };
  });

  /** Lu dans le navigateur seulement (pas au rendu serveur) */
  protected readonly best = signal<number | null>(null);
  protected readonly listened = signal(false);

  constructor() {
    afterNextRender(() => {
      const t = this.theme();
      this.best.set(this.quiz.bestScore(t.id));
      this.listened.set(this.quiz.lessonDone(t.id));
    });
  }
}
