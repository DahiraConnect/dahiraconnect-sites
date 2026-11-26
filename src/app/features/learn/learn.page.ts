import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../core/data/quiz.service';
import { LessonLang, hasLesson } from '../../core/models';
import { lessonLangs } from '../../core/utils/lesson';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { LANG_NAMES } from './lesson-i18n';
import { ThemeCard } from './theme-card/theme-card';

/** Confirmation après le choix, dans la langue choisie */
const LANG_NOTES: Record<LessonLang, string> = {
  fr: 'Les leçons et les quiz s’ouvriront en français.',
  ar: 'ستُفتح الدروس والاختبارات بالعربية.',
  wo: 'Les leçons s’ouvriront en wolof (à écouter).',
};

/**
 * Rubrique « Apprendre » : thèmes à écouter et à jouer, filtrables par catégorie,
 * avec une liste déroulante pour la langue des leçons et des quiz (gardée sur le téléphone).
 */
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

  /** Langue des leçons et des quiz (français tant qu'on n'a rien choisi) */
  protected readonly language = signal<LessonLang>('fr');
  /** Langues proposées : français et arabe ; wolof dès qu'une leçon a ses enregistrements */
  protected readonly offered = computed<LessonLang[]>(() => {
    const wolof = this.themes().some((t) => hasLesson(t) && lessonLangs(t.lesson!).includes('wo'));
    return wolof ? ['fr', 'ar', 'wo'] : ['fr', 'ar'];
  });
  protected readonly names = LANG_NAMES;
  /** Message de confirmation, affiché seulement après un changement de langue */
  protected readonly note = signal('');
  protected readonly noteLang = computed(() => (this.note() ? (this.language() === 'ar' ? 'ar' : 'fr') : null));

  constructor() {
    afterNextRender(() => this.language.set(this.quizService.preferredLessonLang()));
  }

  protected choose(lang: LessonLang): void {
    this.quizService.setLanguage(lang);
    this.language.set(lang);
    this.note.set(LANG_NOTES[lang]);
  }
}
