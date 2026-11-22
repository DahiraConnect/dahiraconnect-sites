import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import { Photo } from '../../../../core/models';
import { AdminAuth } from '../../core/admin-auth.service';
import { formatBytes, uploadPhoto } from '../../core/images';
import { Cropper } from '../cropper/cropper';

/**
 * Choix de photos depuis le téléphone (galerie ou appareil photo).
 * Les images sont réduites avant l'envoi : rapide même en 3G.
 */
@Component({
  selector: 'app-photo-picker',
  imports: [Cropper],
  templateUrl: './photo-picker.html',
  styleUrl: './photo-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoPicker {
  private readonly auth = inject(AdminAuth);

  readonly photos = model<Photo[]>([]);
  /** Sous-dossier du stockage : 'evenements', 'albums/<slug>', 'bureau'… */
  readonly folder = input.required<string>();
  /** Texte alternatif par défaut des nouvelles photos */
  readonly alt = input('');
  readonly max = input(50);
  readonly label = input('Ajouter une photo');
  /** Recadrage carré avant l'envoi (photos de personnes) */
  readonly crop = input(false);
  /** Photo en attente de recadrage */
  protected readonly cropping = signal<File | null>(null);
  /** Libellé du champ pour les lecteurs d'écran */
  readonly inputId = input.required<string>();

  protected readonly pending = signal(0);
  protected readonly error = signal('');
  /** « Photos allégées : 8,4 Mo → 620 Ko » */
  protected readonly saved = signal('');
  protected readonly full = computed(() => this.photos().length >= this.max());

  protected async add(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const slug = this.auth.current()?.slug;
    const files = Array.from(inputEl.files ?? []).slice(0, this.max() - this.photos().length);
    inputEl.value = '';
    if (!slug || !files.length) return;
    if (this.crop()) {
      this.cropping.set(files[0]);
      return;
    }
    await this.send(files);
  }

  /** Après recadrage */
  protected async cropped(file: File): Promise<void> {
    this.cropping.set(null);
    await this.send([file]);
  }

  private async send(files: File[]): Promise<void> {
    const slug = this.auth.current()?.slug;
    if (!slug) return;
    this.error.set('');
    this.pending.update((n) => n + files.length);
    let failed = 0;
    let before = 0;
    let after = 0;
    // Une par une : moins de mémoire sur les petits téléphones
    for (const file of files) {
      try {
        const photo = await uploadPhoto(file, slug, this.folder(), this.alt(), (b, a) => {
          before += b;
          after += a;
        });
        this.photos.update((list) => [...list, photo]);
      } catch {
        failed++;
      } finally {
        this.pending.update((n) => n - 1);
      }
    }
    if (before > after * 1.2) {
      const label = files.length - failed > 1 ? 'Photos allégées' : 'Photo allégée';
      this.saved.set(`${label} : ${formatBytes(before)} → ${formatBytes(after)}. Plus rapide à ouvrir, même en 3G.`);
    }
    if (failed) this.error.set(failed === 1 ? 'Une photo n’a pas pu être envoyée.' : `${failed} photos n’ont pas pu être envoyées.`);
  }

  protected remove(index: number): void {
    this.photos.update((list) => list.filter((_, i) => i !== index));
  }

  protected move(index: number, delta: number): void {
    this.photos.update((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  }
}
