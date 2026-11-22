import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, model, signal } from '@angular/core';
import { AdminAuth } from '../../core/admin-auth.service';
import { removePhoto, uploadAudio } from '../../core/images';

const MAX_BYTES = 5 * 1024 * 1024;

/** Format préféré : Opus (léger) sur Android et ordinateur, AAC sur iPhone */
function pickMimeType(): string | undefined {
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) =>
    typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t),
  );
}

/** Durée d'un fichier audio, en secondes (0 si inconnue) */
function durationOf(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0);
    };
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}

/**
 * Message vocal, comme sur WhatsApp : un gros bouton micro, un compteur, arrêt automatique.
 * Ou un fichier audio déjà enregistré (vocal WhatsApp, enregistreur du téléphone).
 */
@Component({
  selector: 'app-voice-recorder',
  templateUrl: './voice-recorder.html',
  styleUrl: './voice-recorder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceRecorder {
  private readonly auth = inject(AdminAuth);

  readonly url = model<string | undefined>();
  readonly seconds = model<number | undefined>();
  readonly folder = input('annonces');
  readonly maxSeconds = input(120);

  protected readonly state = signal<'idle' | 'recording' | 'uploading'>('idle');
  protected readonly elapsed = signal(0);
  protected readonly error = signal('');
  protected readonly canRecord = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!pickMimeType();
  protected readonly clock = computed(() => {
    const s = this.elapsed();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });

  private recorder?: MediaRecorder;
  private stream?: MediaStream;
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cleanup());
  }

  protected async start(): Promise<void> {
    this.error.set('');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.error.set('Le micro est bloqué. Autorisez le micro pour ce site dans le navigateur, puis réessayez.');
      return;
    }
    const chunks: Blob[] = [];
    const mimeType = pickMimeType();
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType, audioBitsPerSecond: 32_000 } : undefined);
    this.recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    this.recorder.onstop = () => {
      const blob = new Blob(chunks, { type: this.recorder?.mimeType || mimeType || 'audio/webm' });
      const seconds = this.elapsed();
      this.cleanup();
      void this.save(blob, seconds);
    };
    this.elapsed.set(0);
    this.state.set('recording');
    this.recorder.start();
    this.timer = setInterval(() => {
      this.elapsed.update((s) => s + 1);
      if (this.elapsed() >= this.maxSeconds()) this.stop();
    }, 1000);
  }

  protected stop(): void {
    if (this.recorder?.state === 'recording') this.recorder.stop();
  }

  protected async pickFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      this.error.set('Fichier trop lourd (5 Mo au plus). Enregistrez un message plus court.');
      return;
    }
    this.error.set('');
    await this.save(file, await durationOf(file));
  }

  protected async remove(): Promise<void> {
    const old = this.url();
    this.url.set(undefined);
    this.seconds.set(undefined);
    if (old) await removePhoto({ url: old, alt: '', width: 0, height: 0 }).catch(() => undefined);
  }

  private async save(blob: Blob, seconds: number): Promise<void> {
    const slug = this.auth.current()?.slug;
    if (!slug || !blob.size) {
      this.state.set('idle');
      return;
    }
    this.state.set('uploading');
    try {
      const old = this.url();
      this.url.set(await uploadAudio(blob, slug, this.folder()));
      this.seconds.set(seconds || undefined);
      if (old) void removePhoto({ url: old, alt: '', width: 0, height: 0 }).catch(() => undefined);
    } catch {
      this.error.set('L’envoi du message vocal a échoué. Vérifiez votre connexion et réessayez.');
    } finally {
      this.state.set('idle');
    }
  }

  private cleanup(): void {
    clearInterval(this.timer);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
  }
}
