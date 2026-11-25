import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { LessonLang, hasQuiz } from '../../core/models';
import { cardIn, lessonLangs } from '../../core/utils/lesson';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { LANG_NAMES, LESSON_TEXT } from './lesson-i18n';

/**
 * Leçon d'un thème, pour un public qui écoute plus qu'il ne lit :
 * une carte à la fois, une image, un grand bouton « Écouter »,
 * puis le quiz du thème à la fin.
 */
@Component({
  selector: 'app-lesson-page',
  imports: [RouterLink, DarkHero, NgOptimizedImage],
  templateUrl: './lesson.page.html',
  styleUrl: './lesson.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LessonPage {
  private readonly quiz = inject(QuizService);
  private readonly injector = inject(Injector);

  readonly theme = input.required<string>();

  protected readonly data = computed(() => this.quiz.withLesson(this.theme()));
  protected readonly cards = computed(() => this.data()?.lesson?.cards ?? []);
  protected readonly langs = computed(() => {
    const lesson = this.data()?.lesson;
    return lesson ? lessonLangs(lesson) : (['fr'] as LessonLang[]);
  });
  protected readonly langNames = LANG_NAMES;
  protected readonly lang = signal<LessonLang>('fr');
  protected readonly isAr = computed(() => this.lang() === 'ar');
  protected readonly t = computed(() => LESSON_TEXT[this.lang()]);
  protected readonly title = computed(() => (this.isAr() ? this.data()?.ar?.title : null) ?? this.data()?.title ?? '');
  protected readonly withQuiz = computed(() => {
    const d = this.data();
    return !!d && hasQuiz(d);
  });

  protected readonly index = signal(0);
  /** Écran de fin, après la dernière carte */
  protected readonly done = signal(false);
  protected readonly total = computed(() => this.cards().length);
  protected readonly card = computed(() => {
    const c = this.cards()[this.index()];
    return c ? cardIn(c, this.lang()) : null;
  });
  protected readonly progress = computed(() => ((this.done() ? this.total() : this.index() + 1) / Math.max(1, this.total())) * 100);

  /** Lecture à voix haute du téléphone (français et arabe seulement, s'il n'y a pas d'enregistrement) */
  private readonly canSpeak = signal(false);
  protected readonly canListen = computed(() => !!this.card()?.audio || (this.canSpeak() && this.lang() !== 'wo'));
  protected readonly playing = signal(false);
  /** Une fois « Écouter » touché, les cartes suivantes se lisent toutes seules */
  private listening = false;
  private audio: HTMLAudioElement | null = null;

  private readonly heading = viewChild<ElementRef<HTMLElement>>('cardHeading');

  constructor() {
    afterNextRender(() => {
      const preferred = this.quiz.preferredLessonLang();
      if (this.langs().includes(preferred)) this.lang.set(preferred);
      this.canSpeak.set(typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined');
    });
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected setLang(lang: LessonLang): void {
    this.stop();
    this.lang.set(lang);
    this.quiz.setPreferredLessonLang(lang);
  }

  protected toggleListen(): void {
    if (this.playing()) {
      this.listening = false;
      this.stop();
      return;
    }
    this.listening = true;
    this.play();
  }

  protected previous(): void {
    if (this.index() === 0) return;
    this.go(this.index() - 1);
  }

  protected next(): void {
    if (this.index() < this.total() - 1) return this.go(this.index() + 1);
    this.stop();
    this.done.set(true);
    this.scrollTop();
  }

  protected restart(): void {
    this.done.set(false);
    this.go(0);
  }

  private go(index: number): void {
    this.stop();
    this.index.set(index);
    this.scrollTop();
    afterNextRender(
      () => {
        this.heading()?.nativeElement.focus({ preventScroll: true });
        if (this.listening) this.play();
      },
      { injector: this.injector },
    );
  }

  private play(): void {
    const card = this.card();
    if (!card) return;
    this.stop();
    if (card.audio) {
      const audio = new Audio(card.audio);
      audio.onended = audio.onerror = () => this.playing.set(false);
      this.audio = audio;
      this.playing.set(true);
      audio.play().catch(() => this.playing.set(false));
      return;
    }
    if (!this.canSpeak() || this.lang() === 'wo') return;
    const utterance = new SpeechSynthesisUtterance([card.title, card.text].filter(Boolean).join(' ... '));
    utterance.lang = this.isAr() ? 'ar-SA' : 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = utterance.onerror = () => this.playing.set(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    this.playing.set(true);
  }

  private stop(): void {
    this.audio?.pause();
    this.audio = null;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    this.playing.set(false);
  }

  private scrollTop(): void {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
