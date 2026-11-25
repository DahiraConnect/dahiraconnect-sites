import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../core/data/quiz.service';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { ThemeCard } from './theme-card/theme-card';

/** Rubrique « Apprendre » : thèmes à écouter et à jouer, filtrables par catégorie. */
@Component({
  selector: 'app-learn-page',
  imports: [DarkHero, Reveal, ThemeCard],
  templateUrl: './learn.page.html',
  styleUrl: './learn.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LearnPage {
  private readonly quizService = inject(QuizService);
  protected readonly quiz = this.quizService.quiz;
  private readonly themes = this.quizService.themes;

  /** Catégories, dans l'ordre où elles apparaissent ('' = tout) */
  protected readonly categories = computed(() => [
    ...new Set(this.themes().flatMap((t) => (t.category ? [t.category] : []))),
  ]);
  protected readonly category = signal('');
  protected readonly shown = computed(() =>
    this.category() ? this.themes().filter((t) => t.category === this.category()) : this.themes(),
  );
}
