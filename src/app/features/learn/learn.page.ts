import { ChangeDetectionStrategy, Component, inject, signal, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { QuizTheme, hasArabic, hasLesson, hasQuiz } from '../../core/models';
import { lessonLangs } from '../../core/utils/lesson';
import { plural } from '../../core/utils/plural';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';

/** Rubrique « Apprendre » : chaque thème a une leçon à écouter, un quiz, ou les deux. */
@Component({
  selector: 'app-learn-page',
  imports: [RouterLink, DarkHero, Reveal],
  templateUrl: './learn.page.html',
  styleUrl: './learn.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LearnPage {
  private readonly quizService = inject(QuizService);
  protected readonly quiz = this.quizService.quiz;
  protected readonly themes = this.quizService.themes;
  protected readonly plural = plural;
  protected readonly hasLesson = hasLesson;
  protected readonly hasQuiz = hasQuiz;
  /** Meilleurs scores et leçons écoutées : lus dans le navigateur seulement (pas au rendu serveur) */
  protected readonly best = signal<Record<string, number | null>>({});
  protected readonly listened = signal<Record<string, boolean>>({});

  constructor() {
    afterNextRender(() => {
      const themes = this.themes();
      this.best.set(Object.fromEntries(themes.map((t) => [t.id, this.quizService.bestScore(t.id)])));
      this.listened.set(Object.fromEntries(themes.map((t) => [t.id, this.quizService.lessonDone(t.id)])));
    });
  }

  /** Langues disponibles, ex. « FR · عربي · Wolof » */
  protected langs(t: QuizTheme): { fr: boolean; ar: boolean; wo: boolean } {
    const lesson = t.lesson && hasLesson(t) ? lessonLangs(t.lesson) : [];
    const ar = hasLesson(t) ? lesson.includes('ar') : hasArabic(t);
    return { fr: true, ar, wo: lesson.includes('wo') };
  }
}
