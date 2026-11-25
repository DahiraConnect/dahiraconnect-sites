import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../core/data/quiz.service';
import { QuizTheme, hasArabic, hasLesson, hasParts, hasQuiz } from '../../../core/models';
import { lessonLangs } from '../../../core/utils/lesson';
import { plural } from '../../../core/utils/plural';

/** Carte d'un thème : « Écouter » (vert), « Jouer » (jaune), ou « Voir les leçons » pour un groupe. */
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
  protected readonly parts = computed(() => (hasParts(this.theme()) ? this.quiz.partsOf(this.theme()) : []));
  protected readonly partsCards = computed(() =>
    this.parts().reduce((sum, t) => sum + (t.lesson?.cards.length ?? 0), 0),
  );
  /** Langues en plus du français, ex. « FR · عربي · Wolof » */
  protected readonly langs = computed(() => {
    const t = this.theme();
    const lesson = t.lesson && hasLesson(t) ? lessonLangs(t.lesson) : [];
    return { ar: hasLesson(t) ? lesson.includes('ar') : hasArabic(t), wo: lesson.includes('wo') };
  });

  /** Lu dans le navigateur seulement (pas au rendu serveur) */
  protected readonly best = signal<number | null>(null);
  protected readonly listened = signal(false);

  constructor() {
    afterNextRender(() => {
      const t = this.theme();
      this.best.set(this.quiz.bestScore(t.id));
      const parts = this.parts();
      this.listened.set(parts.length ? parts.every((p) => this.quiz.lessonDone(p.id)) : this.quiz.lessonDone(t.id));
    });
  }
}
