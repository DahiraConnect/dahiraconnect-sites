import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';

/** Ligne « [logos] Wave · 77 000 00 00 · [Copier] » avec retour « Copié ✓ ». */
@Component({
  selector: 'app-copy-number',
  imports: [NgOptimizedImage],
  templateUrl: './copy-number.html',
  styleUrl: './copy-number.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyNumber {
  private readonly document = inject(DOCUMENT);

  readonly label = input.required<string>();
  readonly number = input.required<string>();
  /** Logos des services (un ou plusieurs si le numéro est partagé) */
  readonly logos = input<string[]>([]);

  protected readonly copied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    const value = this.number().replace(/\s/g, '');
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      this.legacyCopy(value);
    }
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), 2000);
  }

  /** Repli pour les navigateurs sans API Clipboard (HTTP, anciens Android). */
  private legacyCopy(value: string): void {
    const area = this.document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    this.document.body.appendChild(area);
    area.select();
    this.document.execCommand('copy');
    area.remove();
  }
}
