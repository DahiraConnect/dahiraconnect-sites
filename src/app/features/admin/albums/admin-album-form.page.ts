import { ChangeDetectionStrategy, Component, computed, inject, input, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Album, Photo } from '../../../core/models';
import { parseVideo } from '../../../core/utils/video';
import { AdminAuth } from '../core/admin-auth.service';
import { deleteDoc, getDoc, listDocs, saveDoc } from '../core/docs';
import { removePhoto } from '../core/images';
import { PublishService } from '../core/publish.service';
import { slugify, uniqueSlug } from '../core/slug';
import { PhotoPicker } from '../ui/photo-picker/photo-picker';

interface AlbumForm {
  title: string;
  date: string;
  place: string;
  kind: 'photos' | 'video';
  videoUrl: string;
  featured: boolean;
}

/** Ajout ou modification d'un album : photos envoyées depuis le téléphone, ou lien TikTok / YouTube. */
@Component({
  selector: 'app-admin-album-form',
  imports: [FormsModule, RouterLink, PhotoPicker],
  templateUrl: './admin-album-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminAlbumFormPage {
  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);
  private readonly publish = inject(PublishService);

  readonly id = input<string>();

  protected form: AlbumForm = { title: '', date: '', place: '', kind: 'photos', videoUrl: '', featured: false };
  protected readonly photos = signal<Photo[]>([]);
  protected readonly busy = signal(false);
  protected readonly errors = signal<Partial<Record<keyof AlbumForm, string>>>({});
  protected readonly saveError = signal('');
  /** Dossier de stockage des photos de cet album */
  protected readonly folder = signal(`albums/${Date.now().toString(36)}`);
  protected readonly videoLabel = computed(() => (this.videoUrl() ? parseVideo(this.videoUrl()).label : ''));
  private readonly videoUrl = signal('');
  private original: Album | null = null;

  protected readonly row = resource({
    params: () => this.id(),
    loader: async ({ params }) => {
      const row = await getDoc<Album>('albums', params);
      if (row) this.fill(row.data);
      return row;
    },
  });

  private fill(a: Album): void {
    this.original = a;
    this.form = {
      title: a.title,
      date: a.date.slice(0, 10),
      place: a.place ?? '',
      kind: a.kind,
      videoUrl: a.videoUrl ?? '',
      featured: !!a.featured,
    };
    this.videoUrl.set(this.form.videoUrl);
    this.folder.set(`albums/${a.slug}`);
    // La couverture passe en premier : « Principale » = couverture
    const photos = [...(a.photos ?? [])];
    const coverIndex = photos.findIndex((p) => p.url === a.coverUrl);
    if (coverIndex > 0) photos.unshift(...photos.splice(coverIndex, 1));
    this.photos.set(photos);
  }

  protected onVideoInput(value: string): void {
    this.videoUrl.set(value.trim());
  }

  protected revalidate(): void {
    if (Object.keys(this.errors()).length) this.validate();
  }

  private validate(): boolean {
    const f = this.form;
    const errors: Partial<Record<keyof AlbumForm, string>> = {};
    if (!f.title.trim()) errors.title = 'Indiquez le titre de l’album.';
    if (!f.date) errors.date = 'Choisissez la date.';
    if (f.kind === 'video') {
      if (!f.videoUrl.trim()) errors.videoUrl = 'Collez le lien de la vidéo.';
      else if (parseVideo(f.videoUrl.trim()).platform === 'other')
        errors.videoUrl = 'Lien non reconnu : collez un lien TikTok, YouTube ou Facebook.';
    }
    this.errors.set(errors);
    return !Object.keys(errors).length;
  }

  protected async save(): Promise<void> {
    if (!this.validate()) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const dahira = this.auth.current();
    if (!dahira) return;
    this.busy.set(true);
    this.saveError.set('');
    try {
      const f = this.form;
      let slug = this.original?.slug;
      if (!slug) {
        const existing = await listDocs<Album>('albums', dahira.dahiraId, 'date');
        slug = uniqueSlug(slugify(f.title), existing.map((r) => r.slug));
      }
      const photos = f.kind === 'photos' ? this.photos() : [];
      const cover = photos[0];
      const album: Album = {
        ...(this.original ?? {}),
        id: this.original?.id ?? crypto.randomUUID(),
        slug,
        title: f.title.trim(),
        date: f.date,
        place: f.place.trim() || undefined,
        kind: f.kind,
        featured: f.featured || undefined,
        videoUrl: f.kind === 'video' ? f.videoUrl.trim() : undefined,
        photos: photos.length ? photos : undefined,
        coverUrl: cover?.url,
        coverThumbUrl: cover?.thumbUrl,
        // Le nombre affiché suit les photos réellement en ligne
        count: undefined,
        fallback: this.original?.fallback ?? 'green',
      };
      const clean = JSON.parse(JSON.stringify(album)) as Album;
      const savedId = await saveDoc('albums', dahira.dahiraId, this.id() ?? null, clean, { date: f.date });
      // Un seul album « À la une »
      if (f.featured) {
        const others = await listDocs<Album>('albums', dahira.dahiraId, 'date');
        await Promise.all(
          others
            .filter((r) => r.id !== savedId && r.data.featured)
            .map((r) => saveDoc('albums', dahira.dahiraId, r.id, { ...r.data, featured: undefined }, { date: r.data.date })),
        );
      }
      const kept = new Set(photos.map((p) => p.url));
      await Promise.all((this.original?.photos ?? []).filter((p) => !kept.has(p.url)).map(removePhoto));
      await this.router.navigateByUrl('/admin/galerie');
      void this.publish.afterSave(this.id() ? 'Album modifié' : 'Album ajouté');
    } catch {
      this.saveError.set('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.');
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const id = this.id();
    if (!id || !confirm(`Supprimer l’album « ${this.form.title} » et ses photos ? Cette action est définitive.`)) return;
    this.busy.set(true);
    try {
      await deleteDoc('albums', id);
      await Promise.all((this.original?.photos ?? []).map(removePhoto));
      await this.router.navigateByUrl('/admin/galerie');
      void this.publish.afterSave('Album supprimé');
    } catch {
      this.saveError.set('La suppression a échoué. Réessayez.');
    } finally {
      this.busy.set(false);
    }
  }
}
