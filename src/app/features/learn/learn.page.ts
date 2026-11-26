import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { QuizService } from '../../core/data/quiz.service';
import { LessonLang, hasLesson } from '../../core/models';
import { lessonLangs } from '../../core/utils/lesson';
import { Reveal } from '../../shared/motion/reveal.directive';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { LANG_NAMES } from './lesson-i18n';
import { ThemeCard } from './theme-card/theme-card';

/** Ce que chaque langue propose, écrit dans cette langue */
const LANG_HINTS: Record<LessonLang, string> = {
  fr: 'Lire et écouter en français',
  ar: 'اقرأ واستمع بالعربية',
  wo: 'Écouter en wolof',
};

/**
 * Rubrique « Apprendre » : thèmes à écouter et à jouer, filtrables par catégorie.
 * À la première visite, on demande la langue (une seule fois, gardée sur le téléphone).
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

  /** Langue choisie : undefined avant lecture du téléphone (rien d'affiché), null si jamais choisie */
  protected readonly language = signal<LessonLang | null | undefined>(undefined);
  /** Langues proposées : français et arabe ; wolof dès qu'une leçon a ses enregistrements */
  protected readonly offered = computed<LessonLang[]>(() => {
    const wolof = this.themes().some((t) => hasLesson(t) && lessonLangs(t.lesson!).includes('wo'));
    return wolof ? ['fr', 'ar', 'wo'] : ['fr', 'ar'];
  });
  protected readonly names = LANG_NAMES;
  protected readonly hints = LANG_HINTS;
  protected readonly canSpeak = signal(false);

  constructor() {
    afterNextRender(() => {
      this.language.set(this.quizService.language());
      this.canSpeak.set(typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined');
    });
    inject(DestroyRef).onDestroy(() => {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    });
  }

  protected choose(lang: LessonLang): void {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    this.quizService.setLanguage(lang);
    this.language.set(lang);
  }

  protected change(): void {
    this.language.set(null);
  }

  /** Lit la question à voix haute, en français puis en arabe */
  protected speakQuestion(): void {
    if (!this.canSpeak()) return;
    speechSynthesis.cancel();
    const say = (text: string, lang: string) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9;
      speechSynthesis.speak(u);
    };
    say('Dans quelle langue voulez-vous apprendre ? Français, ou arabe.', 'fr-FR');
    say('بأي لغة تريد أن تتعلم؟ الفرنسية أو العربية.', 'ar-SA');
  }
}
