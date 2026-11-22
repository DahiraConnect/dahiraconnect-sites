import { ChangeDetectionStrategy, Component, inject, input, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Album, DahiraEvent, Photo } from '../../../core/models';
import { fmtMonthYear } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { deleteDoc, getDoc, listDocs, saveDoc } from '../core/docs';
import { removePhoto } from '../core/images';
import { PublishService } from '../core/publish.service';
import { fromIso, slugify, toIso, uniqueSlug } from '../core/slug';
import { PhotoPicker } from '../ui/photo-picker/photo-picker';

interface EventForm {
  title: string;
  date: string;
  time: string;
  timeTbc: boolean;
  endTime: string;
  place: string;
  mapUrl: string;
  description: string;
  isMajor: boolean;
  albumSlug: string;
}

const EMPTY: EventForm = {
  title: '',
  date: '',
  time: '',
  timeTbc: false,
  endTime: '',
  place: '',
  mapUrl: '',
  description: '',
  isMajor: false,
  albumSlug: '',
};

/** Ajout ou modification d'un événement (une seule colonne, bouton Enregistrer toujours visible). */
@Component({
  selector: 'app-admin-event-form',
  imports: [FormsModule, RouterLink, PhotoPicker],
  templateUrl: './admin-event-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminEventFormPage {
  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);
  private readonly publish = inject(PublishService);

  /** Paramètre de route (absent pour un nouvel événement) */
  readonly id = input<string>();

  protected form: EventForm = { ...EMPTY };
  protected readonly images = signal<Photo[]>([]);
  protected readonly busy = signal(false);
  protected readonly errors = signal<Partial<Record<keyof EventForm, string>>>({});
  protected readonly saveError = signal('');
  private original: DahiraEvent | null = null;

  /** Fiche existante, puis remplissage du formulaire */
  protected readonly row = resource({
    params: () => this.id(),
    loader: async ({ params }) => {
      const row = await getDoc<DahiraEvent>('events', params);
      if (row) this.fill(row.data);
      return row;
    },
  });

  /** Albums, pour relier un événement passé à ses photos */
  protected readonly albums = resource({
    params: () => this.auth.current()?.dahiraId,
    loader: ({ params }) => listDocs<Album>('albums', params, 'date', false),
  });

  private fill(e: DahiraEvent): void {
    this.original = e;
    const start = fromIso(e.startsAt);
    this.form = {
      title: e.title,
      date: start.date,
      time: e.timeTbc ? '' : start.time,
      timeTbc: !!e.timeTbc,
      endTime: e.endsAt ? fromIso(e.endsAt).time : '',
      place: e.place,
      mapUrl: e.mapUrl ?? '',
      description: e.description ?? '',
      isMajor: !!e.isMajor,
      albumSlug: e.albumSlug ?? '',
    };
    this.images.set(e.images ?? []);
  }

  /** Après une première tentative : les messages disparaissent dès que le champ est corrigé */
  protected revalidate(): void {
    if (Object.keys(this.errors()).length) this.validate();
  }

  private validate(): boolean {
    const f = this.form;
    const errors: Partial<Record<keyof EventForm, string>> = {};
    if (!f.title.trim()) errors.title = 'Indiquez le nom de l’événement.';
    if (!f.date) errors.date = 'Choisissez la date.';
    if (!f.timeTbc && !f.time) errors.time = 'Indiquez l’heure, ou cochez « Heure pas encore connue ».';
    if (!f.place.trim()) errors.place = 'Indiquez le lieu.';
    if (f.mapUrl && !/^https?:\/\//.test(f.mapUrl.trim())) errors.mapUrl = 'Le lien doit commencer par https://';
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
      const startsAt = toIso(f.date, f.timeTbc ? null : f.time);
      let endsAt: string | undefined;
      if (!f.timeTbc && f.endTime) {
        endsAt = toIso(f.date, f.endTime);
        // Fin après minuit : lendemain
        if (endsAt <= startsAt) endsAt = new Date(new Date(endsAt).getTime() + 86_400_000).toISOString();
      }
      // L'adresse d'un événement existant ne change jamais (liens déjà partagés sur WhatsApp)
      let slug = this.original?.slug;
      if (!slug) {
        const existing = await listDocs<DahiraEvent>('events', dahira.dahiraId, 'starts_at');
        slug = uniqueSlug(slugify(`${f.title} ${fmtMonthYear(startsAt)}`), existing.map((r) => r.slug));
      }
      const event: DahiraEvent = {
        ...(this.original ?? {}),
        id: this.original?.id ?? crypto.randomUUID(),
        slug,
        title: f.title.trim(),
        startsAt,
        endsAt,
        timeTbc: f.timeTbc || undefined,
        place: f.place.trim(),
        mapUrl: f.mapUrl.trim() || undefined,
        description: f.description.trim() || undefined,
        isMajor: f.isMajor || undefined,
        albumSlug: f.albumSlug || undefined,
        images: this.images().length ? this.images() : undefined,
      };
      const clean = JSON.parse(JSON.stringify(event)) as DahiraEvent; // retire les champs vides
      await saveDoc('events', dahira.dahiraId, this.id() ?? null, clean, { starts_at: startsAt });
      // Photos retirées : supprimées du stockage
      const kept = new Set(this.images().map((p) => p.url));
      await Promise.all((this.original?.images ?? []).filter((p) => !kept.has(p.url)).map(removePhoto));
      await this.router.navigateByUrl('/admin/agenda');
      void this.publish.afterSave(this.id() ? 'Événement modifié' : 'Événement ajouté');
    } catch {
      this.saveError.set('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.');
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const id = this.id();
    if (!id || !confirm(`Supprimer « ${this.form.title} » ? Cette action est définitive.`)) return;
    this.busy.set(true);
    try {
      await deleteDoc('events', id);
      await Promise.all((this.original?.images ?? []).map(removePhoto));
      await this.router.navigateByUrl('/admin/agenda');
      void this.publish.afterSave('Événement supprimé');
    } catch {
      this.saveError.set('La suppression a échoué. Réessayez.');
    } finally {
      this.busy.set(false);
    }
  }
}
