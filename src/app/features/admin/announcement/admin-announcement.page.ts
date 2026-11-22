import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Announcement, DahiraEvent } from '../../../core/models';
import { fmtDate } from '../../../core/utils/dates';
import { AnnouncementBanner } from '../../../shared/ui/announcement/announcement';
import { AdminAuth } from '../core/admin-auth.service';
import { DahiraDocStore } from '../core/dahira-doc.store';
import { listDocs } from '../core/docs';
import { HelpTip } from '../ui/help-tip/help-tip';

const MAX = 180;

/** Annonce en haut de l'accueil : une phrase, un lien facultatif, une date de fin. */
@Component({
  selector: 'app-admin-announcement',
  imports: [FormsModule, RouterLink, HelpTip, AnnouncementBanner],
  templateUrl: './admin-announcement.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminAnnouncementPage {
  private readonly auth = inject(AdminAuth);
  protected readonly store = inject(DahiraDocStore);
  protected readonly max = MAX;
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly a = signal<Announcement>({ active: true, text: '', tone: 'info' });

  /** Événements à venir, pour le lien « Voir le détail » */
  protected readonly events = resource({
    params: () => this.auth.current()?.dahiraId,
    loader: async ({ params }) =>
      (await listDocs<DahiraEvent>('events', params, 'starts_at')).filter(
        (r) => r.status !== 'draft' && new Date(r.data.startsAt).getTime() > Date.now() - 86_400_000,
      ),
  });
  protected readonly eventLabel = (e: DahiraEvent) => `${e.title} (${fmtDate(e.startsAt)})`;
  protected readonly preview = computed(() => ({ ...this.a(), active: true, text: this.a().text || 'Votre annonce apparaîtra ici.' }));

  constructor() {
    this.store.load(true).finally(() => this.loading.set(false));
    effect(() => {
      const current = this.store.profile()?.announcement;
      if (current) this.a.set({ ...current });
    });
  }

  protected patch(p: Partial<Announcement>): void {
    this.a.update((a) => ({ ...a, ...p }));
  }

  /** Lien : un événement (page du site) ou aucun */
  protected setLink(url: string): void {
    this.patch({ linkUrl: url || undefined, linkLabel: url ? 'Voir le détail' : undefined });
  }

  protected async save(active: boolean): Promise<void> {
    const profile = this.store.profile();
    const a = { ...this.a(), active, text: this.a().text.trim() };
    if (active && !a.text) {
      this.error.set('Écrivez l’annonce avant de l’afficher.');
      return;
    }
    if (a.until && a.until < new Date().toISOString().slice(0, 10)) {
      this.error.set('La date de fin est déjà passée.');
      return;
    }
    if (!profile) return;
    this.error.set('');
    this.busy.set(true);
    const ok = await this.store.saveProfile(
      JSON.parse(JSON.stringify({ ...profile, announcement: a })),
      active ? 'Annonce affichée sur l’accueil' : 'Annonce retirée de l’accueil',
    );
    this.busy.set(false);
    if (ok) this.a.set(a);
    else this.error.set('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.');
  }
}
