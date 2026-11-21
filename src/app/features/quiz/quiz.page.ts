import { ChangeDetectionStrategy, Component, inject, signal, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { hasArabic } from '../../core/models';
import { plural } from '../../core/utils/plural';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';

/** Liste des thèmes du quiz. */
@Component({
  selector: 'app-quiz-page',
  imports: [RouterLink, DarkHero, Reveal],
  templateUrl: './quiz.page.html',
  styleUrl: './quiz.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuizPage {
  private readonly quizService = inject(QuizService);
  protected readonly quiz = this.quizService.quiz;
  protected readonly themes = this.quizService.themes;
  protected readonly plural = plural;
  protected readonly hasArabic = hasArabic;
  /** Meilleurs scores : lus dans le navigateur seulement (pas au rendu serveur) */
  protected readonly best = signal<Record<string, number | null>>({});

  constructor() {
    afterNextRender(() => {
      this.best.set(Object.fromEntries(this.themes().map((t) => [t.id, this.quizService.bestScore(t.id)])));
    });
  }
}
