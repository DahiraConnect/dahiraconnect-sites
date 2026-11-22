import { Injectable, signal } from '@angular/core';

const MUTE_KEY = 'dc-quiz-muted';
const CLIPS = {
  court: '/assets/quiz/sons/applaudissements-court.m4a', // bonne réponse (1,5 s)
  long: '/assets/quiz/sons/applaudissements-long.m4a', // fin de partie réussie (4,5 s)
} as const;
type Clip = keyof typeof CLIPS;

/**
 * Sons du quiz : vrais applaudissements enregistrés (domaine public, voir assets/quiz/sons),
 * carillon et son d'erreur doux fabriqués sur le téléphone. Coupables (choix mémorisé).
 */
@Injectable({ providedIn: 'root' })
export class QuizSoundService {
  readonly muted = signal(this.readMuted());
  private ctx?: AudioContext;
  private readonly buffers = new Map<Clip, Promise<AudioBuffer | null>>();

  toggle(): void {
    this.muted.update((m) => !m);
    try {
      localStorage.setItem(MUTE_KEY, this.muted() ? '1' : '0');
    } catch {
      /* pas de stockage : le choix vaut pour cette visite */
    }
  }

  /** À appeler au début d'une partie (geste de l'utilisateur) : charge les applaudissements */
  preload(): void {
    const ctx = this.audio();
    if (ctx) (Object.keys(CLIPS) as Clip[]).forEach((clip) => this.load(ctx, clip));
  }

  /** Bonne réponse : petit carillon doux puis applaudissements */
  success(): void {
    const ctx = this.audio();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(ctx, 660, t, 0.5, 0.07);
    this.tone(ctx, 880, t + 0.09, 0.6, 0.07);
    void this.play('court', 0.9, 0.05);
  }

  /** Mauvaise réponse : note grave, douce, qui descend */
  error(): void {
    const ctx = this.audio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.4);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  /** Fin de partie réussie : longs applaudissements */
  cheer(): void {
    void this.play('long', 0.9);
  }

  // ——— Lecture ———

  private async play(clip: Clip, volume: number, delay = 0): Promise<void> {
    const ctx = this.audio();
    if (!ctx) return;
    const buffer = await this.load(ctx, clip);
    if (!buffer || this.muted()) return;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buffer;
    gain.gain.value = volume;
    src.connect(gain).connect(ctx.destination);
    src.start(ctx.currentTime + delay);
  }

  /** Téléchargé et décodé une seule fois ; échec (hors ligne sans cache…) = pas de son, sans erreur */
  private load(ctx: AudioContext, clip: Clip): Promise<AudioBuffer | null> {
    let pending = this.buffers.get(clip);
    if (!pending) {
      pending = fetch(CLIPS[clip])
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(res.status)))
        .then((bytes) => ctx.decodeAudioData(bytes))
        .catch(() => null);
      this.buffers.set(clip, pending);
    }
    return pending;
  }

  /** Note douce : attaque progressive, extinction lente (son de cloche) */
  private tone(ctx: AudioContext, freq: number, at: number, length: number, volume: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }

  /** Contexte audio créé au premier geste de l'utilisateur (règle des navigateurs) */
  private audio(): AudioContext | undefined {
    if (this.muted() || typeof window === 'undefined') return undefined;
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return undefined;
    this.ctx ??= new Ctor();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private readMuted(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
