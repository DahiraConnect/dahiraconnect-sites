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
import { cardIn, lessonLangs, lessonOutline } from '../../core/utils/lesson';
import { buildWaShare } from '../../core/utils/whatsapp';
import { TenantService } from '../../core/tenant/tenant.service';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { LANG_NAMES, LESSON_TEXT } from './lesson-i18n';

/**
 * Leçon d'un thème, pour un public qui écoute plus qu'il ne lit :
 * une carte à la fois, un grand bouton « Écouter » qui lit toute la leçon
 * à la suite (comme la radio), reprise là où on s'était arrêté,
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
  private readonly tenant = inject(TenantService);

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
  /** Partager la leçon sur WhatsApp (le lien ouvre la leçon) */
  protected readonly shareUrl = computed(() => {
    const d = this.data();
    if (!d) return '';
    const name = this.tenant.dahira().name;
    const text = this.isAr()
      ? `استمع إلى درس «${this.title()}» – ${name}. درس قصير، يُقرأ لك بصوت عالٍ.`
      : `Écoute la leçon « ${d.title} » du ${name}. C'est court, et le téléphone la lit pour toi.`;
    return buildWaShare(text, this.tenant.absoluteUrl(`/apprendre/${d.id}`));
  });
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
  /** Cartes déjà vues (sommaire du panneau, sur ordinateur) */
  protected readonly seen = signal<ReadonlySet<number>>(new Set([0]));
  /** Sommaire par partie (panneau sur ordinateur) */
  protected readonly outline = computed(() =>
    lessonOutline(
      this.cards().map((c) => cardIn(c, this.lang()).title),
      this.cards().map((c) => c.chapter),
    ),
  );
  /** On a repris la leçon en cours de route : proposer de recommencer */
  protected readonly resumed = signal(false);
  protected readonly progress = computed(() => ((this.done() ? this.total() : this.index() + 1) / Math.max(1, this.total())) * 100);

  /** Lecture à voix haute du téléphone (français et arabe seulement, s'il n'y a pas d'enregistrement) */
  private readonly canSpeak = signal(false);
  protected readonly canListen = computed(() => !!this.card()?.audio || (this.canSpeak() && this.lang() !== 'wo'));
  protected readonly playing = signal(false);
  /** Écoute continue : une fois « Écouter » touché, toutes les cartes se lisent à la suite */
  private listening = false;
  private audio: HTMLAudioElement | null = null;
  /** Lecture en cours : seule elle peut faire avancer (un arrêt peut déclencher la fin d'une ancienne lecture) */
  private current: object | null = null;
  private nextTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly heading = viewChild<ElementRef<HTMLElement>>('cardHeading');

  constructor() {
    afterNextRender(() => {
      const preferred = this.quiz.preferredLessonLang();
      if (this.langs().includes(preferred)) this.lang.set(preferred);
      this.canSpeak.set(typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined');
      // Reprendre à la carte où l'on s'était arrêté
      const position = this.quiz.lessonPosition(this.theme());
      if (position > 0 && position < this.total()) {
        this.index.set(position);
        this.seen.set(new Set(Array.from({ length: position + 1 }, (_, i) => i)));
        this.resumed.set(true);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.listening = false;
      this.stop();
    });
  }

  protected setLang(lang: LessonLang): void {
    this.listening = false;
    this.stop();
    this.lang.set(lang);
    this.quiz.setLanguage(lang);
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
    this.listening = false;
    this.stop();
    this.done.set(true);
    this.quiz.markLessonDone(this.theme());
    this.quiz.saveLessonPosition(this.theme(), 0);
    this.scrollTop();
  }

  /** Sommaire : aller directement à une carte */
  protected goTo(index: number): void {
    this.done.set(false);
    this.go(index);
  }

  protected restart(): void {
    this.done.set(false);
    this.seen.set(new Set([0]));
    this.go(0);
  }

  private go(index: number): void {
    this.stop();
    this.resumed.set(false);
    this.index.set(index);
    this.seen.update((s) => new Set(s).add(index));
    this.quiz.saveLessonPosition(this.theme(), index);
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
      audio.onended = () => this.ended(audio);
      audio.onerror = () => this.current === audio && this.playing.set(false);
      this.audio = audio;
      this.current = audio;
      this.playing.set(true);
      audio.play().catch(() => this.playing.set(false));
      return;
    }
    if (!this.canSpeak() || this.lang() === 'wo') return;
    const utterance = new SpeechSynthesisUtterance([card.title, card.text].filter(Boolean).join(' ... '));
    utterance.lang = this.isAr() ? 'ar-SA' : 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = () => this.ended(utterance);
    utterance.onerror = () => this.current === utterance && this.playing.set(false);
    speechSynthesis.cancel();
    this.current = utterance;
    speechSynthesis.speak(utterance);
    this.playing.set(true);
  }

  /** Fin de la carte : en écoute continue, la suivante après un court silence */
  private ended(source: object): void {
    if (source !== this.current) return;
    this.current = null;
    this.playing.set(false);
    if (!this.listening) return;
    clearTimeout(this.nextTimer);
    this.nextTimer = setTimeout(() => {
      if (this.listening) this.next();
    }, 1200);
  }

  private stop(): void {
    clearTimeout(this.nextTimer);
    this.current = null;
    this.audio?.pause();
    this.audio = null;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    this.playing.set(false);
  }

  private scrollTop(): void {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
