import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { ThemeCard } from './theme-card/theme-card';

/** Thème qui regroupe plusieurs leçons (ex. les 23 chartes en 5 leçons). */
@Component({
  selector: 'app-group-page',
  imports: [RouterLink, DarkHero, Reveal, ThemeCard],
  templateUrl: './group.page.html',
  styleUrl: './learn.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GroupPage {
  private readonly quiz = inject(QuizService);

  readonly theme = input.required<string>();

  protected readonly group = computed(() => this.quiz.withParts(this.theme()));
  protected readonly parts = computed(() => {
    const g = this.group();
    return g ? this.quiz.partsOf(g) : [];
  });
}
