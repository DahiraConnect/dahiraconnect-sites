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
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { QuizSoundService } from '../../core/data/quiz-sounds.service';
import { QuizLang, hasArabic, hasLesson } from '../../core/models';
import { QUIZ_TEXT, SOURCE_AR } from './quiz-i18n';
import { TenantService } from '../../core/tenant/tenant.service';
import { plural } from '../../core/utils/plural';
import { PlayableQuestion, preparePlay, scoreMessage } from '../../core/utils/quiz';
import { buildWaShare } from '../../core/utils/whatsapp';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';
import { Confetti } from '../../shared/ui/confetti/confetti';

type Step = 'intro' | 'question' | 'done';

/**
 * Un thème du quiz, pensé pour un public peu à l'aise avec le numérique :
 * une question à la fois, grands boutons, réponse corrigée tout de suite,
 * bandeau « Continuer » toujours visible en bas, lecture à voix haute.
 */
@Component({
  selector: 'app-quiz-play-page',
  imports: [RouterLink, DarkHero, Confetti],
  templateUrl: './quiz-play.page.html',
  styleUrl: './quiz-play.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuizPlayPage {
  private readonly quiz = inject(QuizService);
  private readonly tenant = inject(TenantService);
  private readonly injector = inject(Injector);
  protected readonly sound = inject(QuizSoundService);

  readonly theme = input.required<string>();

  protected readonly data = computed(() => this.quiz.byId(this.theme()));
  /** Langue choisie (les thèmes malikites existent aussi en arabe) */
  protected readonly lang = signal<QuizLang>('fr');
  protected readonly arabicAvailable = computed(() => {
    const d = this.data();
    return !!d && hasArabic(d);
  });
  protected readonly t = computed(() => QUIZ_TEXT[this.lang()]);
  /** Retour : le groupe du thème s'il en a un, sinon la rubrique */
  protected readonly backLink = computed(() => {
    const parent = this.quiz.parentOf(this.theme());
    return parent ? ['/apprendre', parent.id] : ['/apprendre'];
  });
  /** Le thème a une leçon : on propose de l'écouter avant de jouer */
  protected readonly lesson = computed(() => {
    const d = this.data();
    return !!d && hasLesson(d);
  });
  protected readonly isAr = computed(() => this.lang() === 'ar');
  protected readonly title = computed(() => (this.isAr() ? this.data()?.ar?.title : this.data()?.title) ?? '');
  protected readonly description = computed(
    () => (this.isAr() ? this.data()?.ar?.description : this.data()?.description) ?? '',
  );
  protected readonly source = computed(() => (this.data()?.source ? (this.isAr() ? SOURCE_AR : this.data()!.source) : ''));
  protected readonly step = signal<Step>('intro');
  protected readonly questions = signal<PlayableQuestion[]>([]);
  protected readonly index = signal(0);
  /** Réponse choisie pour chaque question (null = pas encore répondu) */
  protected readonly picks = signal<(number | null)[]>([]);
  protected readonly best = signal<number | null>(null);
  /** Lecture à voix haute disponible sur cet appareil */
  protected readonly canSpeak = signal(false);
  protected readonly speaking = signal(false);

  protected readonly current = computed(() => this.questions()[this.index()]);
  protected readonly picked = computed(() => this.picks()[this.index()] ?? null);
  protected readonly isRight = computed(() => this.picked() !== null && this.picked() === this.current()?.answer);
  protected readonly total = computed(() => this.questions().length || this.data()?.questions.length || 0);
  protected readonly score = computed(() =>
    this.picks().filter((p, i) => p !== null && p === this.questions()[i]?.answer).length,
  );
  protected readonly isLast = computed(() => this.index() === this.questions().length - 1);
  protected readonly progress = computed(
    () => ((this.index() + (this.picked() !== null ? 1 : 0)) / Math.max(1, this.total())) * 100,
  );
  protected readonly message = computed(() => scoreMessage(this.score(), this.total(), this.lang()));
  /** Étoiles gagnées (0 à 3) */
  protected readonly stars = computed(() => {
    const ratio = this.total() ? this.score() / this.total() : 0;
    return ratio === 1 ? 3 : ratio >= 0.75 ? 2 : ratio >= 0.5 ? 1 : 0;
  });
  /** Bon score : confettis et applaudissements */
  protected readonly celebrate = computed(() => this.score() * 2 >= this.total());
  /** Médaille : trophée (sans faute), médaille (bon score), pousse (encouragement) */
  protected readonly medal = computed(() =>
    this.stars() === 3 ? 'ph-trophy' : this.celebrate() ? 'ph-medal' : 'ph-plant',
  );
  /** Score affiché, qui compte de 0 jusqu'au résultat */
  protected readonly shownScore = signal(0);
  protected readonly plural = plural;
  protected readonly shareUrl = computed(() => {
    const d = this.data();
    if (!d) return '';
    const text = this.isAr()
      ? `حصلت على ${this.score()}/${this.total()} في «${this.title()}» – ${this.tenant.dahira().name}. جرّب أنت!`
      : `J'ai obtenu ${this.score()}/${this.total()} au quiz « ${d.title} » du ${this.tenant.dahira().name}. À ton tour !`;
    return buildWaShare(text, this.tenant.absoluteUrl(`/quiz/${d.id}`));
  });

  private readonly continueBtn = viewChild<ElementRef<HTMLElement>>('continueBtn');
  private readonly heading = viewChild<ElementRef<HTMLElement>>('questionHeading');

  constructor() {
    afterNextRender(() => {
      this.best.set(this.quiz.bestScore(this.theme()));
      if (this.arabicAvailable() && this.quiz.preferredLang() === 'ar') this.lang.set('ar');
      this.canSpeak.set(typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined');
    });
    inject(DestroyRef).onDestroy(() => this.stopSpeaking());
  }

  protected setLang(lang: QuizLang): void {
    this.lang.set(lang);
    this.quiz.setPreferredLang(lang);
  }

  protected start(): void {
    const d = this.data();
    if (!d) return;
    this.sound.preload();
    this.questions.set(preparePlay(d.questions, Math.random, !!d.keepOrder, this.lang()));
    this.picks.set(d.questions.map(() => null));
    this.index.set(0);
    this.step.set('question');
    this.scrollTop();
    this.focus(this.heading);
  }

  protected choose(choice: number): void {
    if (this.picked() !== null) return;
    this.stopSpeaking();
    this.picks.update((p) => p.map((v, i) => (i === this.index() ? choice : v)));
    // Retour sonore (applaudissements si juste) et tactile (Android)
    if (this.isRight()) this.sound.success();
    else this.sound.error();
    navigator.vibrate?.(this.isRight() ? 40 : [60, 50, 60]);
    this.focus(this.continueBtn);
  }

  protected next(): void {
    this.stopSpeaking();
    if (this.isLast()) {
      this.quiz.saveScore(this.theme(), this.score());
      this.best.set(this.quiz.bestScore(this.theme()));
      this.step.set('done');
      this.countUp();
      // Bon score (au moins la moitié) : salve d'applaudissements
      if (this.celebrate()) this.sound.cheer();
      this.scrollTop();
      return;
    }
    this.index.update((i) => i + 1);
    this.scrollTop();
    this.focus(this.heading);
  }

  /** Le score défile de 0 au résultat (instantané si mouvements réduits) */
  private countUp(): void {
    const target = this.score();
    if (typeof window === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches || !target) {
      this.shownScore.set(target);
      return;
    }
    this.shownScore.set(0);
    const start = performance.now();
    const DURATION = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      this.shownScore.set(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** Lit la question et les réponses à voix haute (aide à la lecture). */
  protected speak(): void {
    const q = this.current();
    if (!q || !this.canSpeak()) return;
    if (this.speaking()) return this.stopSpeaking();
    const or = this.isAr() ? ' ... أو ... ' : ' ... ou ... ';
    const utterance = new SpeechSynthesisUtterance(`${q.question} ... ${q.choices.join(or)}`);
    utterance.lang = this.isAr() ? 'ar-SA' : 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = utterance.onerror = () => this.speaking.set(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    this.speaking.set(true);
  }

  private stopSpeaking(): void {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    this.speaking.set(false);
  }

  private scrollTop(): void {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Lecteurs d'écran / clavier : focus sur la zone qui vient de changer, une fois affichée */
  private focus(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }
}
