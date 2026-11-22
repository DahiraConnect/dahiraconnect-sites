import { EmptyState } from '../ui/empty-state/empty-state';
import { DialogService } from '../core/dialog.service';
import { ChangeDetectionStrategy, Component, computed, inject, input, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DahiraEvent } from '../../../core/models';
import { fmtDate, fmtEventTime } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { getDoc } from '../core/docs';
import { relativeTime } from '../core/labels';
import { formatLocal, toWhatsappNumber } from '../core/phone';
import { PublishService } from '../core/publish.service';
import { ImportResult, downloadTemplate, exportParticipantsXlsx, readParticipantsFile } from '../core/excel';
import { csvCell, matches, parseNameLine } from '../core/search';
import { supabase } from '../core/supabase';
import { HelpTip } from '../ui/help-tip/help-tip';

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  people: number;
  source: 'site' | 'admin' | 'import';
  created_at: string;
}

const SOURCE: Record<Participant['source'], string> = { site: 'Site', admin: 'Ajouté', import: 'Liste' };

/** Participants d'un événement : recherche, ajout, import d'une liste, export CSV et PDF. */
@Component({
  selector: 'app-admin-participants',
  imports: [EmptyState, FormsModule, RouterLink, HelpTip],
  templateUrl: './admin-participants.page.html',
  styleUrl: './admin-participants.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminParticipantsPage {
  private readonly dialogs = inject(DialogService);
  private readonly auth = inject(AdminAuth);
  private readonly notices = inject(PublishService);
  readonly id = input.required<string>();

  protected readonly query = signal('');
  protected readonly panel = signal<'none' | 'add' | 'import'>('none');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected first = '';
  protected last = '';
  protected phone = '';
  protected people = 1;
  protected importText = '';
  /** Fichier Excel lu, en attente de confirmation */
  protected readonly preview = signal<ImportResult | null>(null);
  protected readonly exportOpen = signal(false);
  protected readonly source = SOURCE;
  protected readonly when = relativeTime;
  /** « 772223344 » → « 77 222 33 44 » */
  protected readonly phoneLabel = (p: string) => formatLocal(toWhatsappNumber(p) || p);

  protected readonly event = resource({
    params: () => this.id(),
    loader: ({ params }) => getDoc<DahiraEvent>('events', params),
  });

  protected readonly list = resource({
    params: () => this.id(),
    loader: async ({ params }) => {
      const { data, error } = await supabase()
        .from('event_registrations')
        .select('id, first_name, last_name, phone, people, source, created_at')
        .eq('event_id', params)
        .order('last_name')
        .order('first_name');
      if (error) throw error;
      return data as Participant[];
    },
  });

  protected readonly filtered = computed(() =>
    (this.list.value() ?? []).filter((p) => matches(this.query(), p.first_name, p.last_name, p.phone)),
  );
  protected readonly totalPeople = computed(() => (this.list.value() ?? []).reduce((n, p) => n + p.people, 0));
  protected readonly eventMeta = computed(() => {
    const e = this.event.value()?.data;
    return e ? `${fmtDate(e.startsAt)} · ${fmtEventTime(e)} · ${e.place}` : '';
  });

  protected toggle(panel: 'add' | 'import'): void {
    this.error.set('');
    this.panel.update((p) => (p === panel ? 'none' : panel));
  }

  private row(first: string, last: string, phone: string | undefined, people: number, source: Participant['source']) {
    const ev = this.event.value();
    return {
      dahira_id: ev?.dahira_id ?? this.auth.current()?.dahiraId,
      event_id: this.id(),
      first_name: first,
      last_name: last,
      phone: phone || null,
      people,
      source,
    };
  }

  protected async add(): Promise<void> {
    if (!this.first.trim() || !this.last.trim()) {
      this.error.set('Écrivez le prénom et le nom.');
      return;
    }
    this.busy.set(true);
    const { error } = await supabase()
      .from('event_registrations')
      .insert(this.row(this.first.trim(), this.last.trim(), this.phone.trim(), this.people || 1, 'admin'));
    this.busy.set(false);
    if (error) {
      this.error.set(error.code === '23505' ? 'Cette personne est déjà inscrite.' : 'L’ajout a échoué. Réessayez.');
      return;
    }
    this.notices.show({ kind: 'ok', text: `${this.first.trim()} ${this.last.trim()} est inscrit.` });
    this.first = this.last = this.phone = '';
    this.people = 1;
    this.error.set('');
    this.list.reload();
  }

  /** Modèle Excel à télécharger */
  protected async template(): Promise<void> {
    await downloadTemplate(this.event.value()?.data.title ?? 'événement');
  }

  /** Fichier Excel choisi : lecture et vérification, sans rien enregistrer encore */
  protected async pickFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.error.set('');
    try {
      this.preview.set(await readParticipantsFile(file));
    } catch {
      this.preview.set(null);
      this.error.set('Ce fichier ne peut pas être lu. Utilisez le modèle Excel (.xlsx).');
    }
  }

  protected async confirmFile(): Promise<void> {
    const p = this.preview();
    if (!p?.people.length) return;
    await this.insertMany(p.people.map((x) => ({ first: x.first, last: x.last, phone: x.phone, people: x.people })), 0);
    this.preview.set(null);
  }

  /** Une personne par ligne ; les doublons (déjà inscrits ou répétés) sont ignorés */
  protected async importList(): Promise<void> {
    const lines = this.importText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map(parseNameLine);
    const ok = parsed.filter((p): p is NonNullable<typeof p> => !!p);
    const ignored = parsed.length - ok.length;
    if (!ok.length) {
      this.error.set('Aucun nom reconnu. Écrivez une personne par ligne : « Prénom Nom ».');
      return;
    }
    await this.insertMany(ok.map((p) => ({ ...p, people: 1 })), ignored);
    this.importText = '';
  }

  private async insertMany(list: { first: string; last: string; phone?: string; people: number }[], ignored: number): Promise<void> {
    this.busy.set(true);
    const { data, error } = await supabase()
      .from('event_registrations')
      .upsert(list.map((p) => this.row(p.first, p.last, p.phone, p.people, 'import')), {
        onConflict: 'event_id,name_key',
        ignoreDuplicates: true,
      })
      .select('id');
    this.busy.set(false);
    if (error) {
      this.error.set('L’import a échoué. Vérifiez la liste et réessayez.');
      return;
    }
    const ok = list;
    const added = data?.length ?? 0;
    const dup = ok.length - added;
    this.notices.show({
      kind: 'ok',
      text: `${added} personne${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''}` +
        (dup ? `, ${dup} déjà inscrite${dup > 1 ? 's' : ''} (ignorée${dup > 1 ? 's' : ''})` : '') +
        (ignored ? `, ${ignored} ligne${ignored > 1 ? 's' : ''} sans nom complet` : '') + '.',
    });
    this.panel.set('none');
    this.error.set('');
    this.list.reload();
  }

  /** Export : Excel, CSV ou PDF à imprimer */
  protected async exportXlsx(): Promise<void> {
    this.exportOpen.set(false);
    const e = this.event.value()?.data;
    await exportParticipantsXlsx(
      (this.list.value() ?? []).map((p) => ({ ...p, source: SOURCE[p.source] })),
      `participants-${e?.slug ?? 'evenement'}.xlsx`,
    );
  }

  protected async remove(p: Participant): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: `Retirer ${p.first_name} ${p.last_name} ?`,
      message: 'Cette personne ne sera plus dans la liste des participants.',
      confirmLabel: 'Retirer',
      tone: 'danger',
      icon: 'ph-user-minus',
    });
    if (!confirmed) return;
    const { error } = await supabase().from('event_registrations').delete().eq('id', p.id);
    if (error) this.notices.show({ kind: 'warn', text: 'La suppression a échoué.' });
    else this.list.reload();
  }

  /** Fichier CSV (Excel, Google Sheets) */
  protected exportCsv(): void {
    this.exportOpen.set(false);
    const e = this.event.value()?.data;
    const header = ['N°', 'Prénom', 'Nom', 'Téléphone', 'Personnes', 'Inscrit le', 'Origine'];
    const rows = (this.list.value() ?? []).map((p, i) => [
      i + 1,
      p.first_name,
      p.last_name,
      p.phone ?? '',
      p.people,
      new Date(p.created_at).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' }),
      SOURCE[p.source],
    ]);
    const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${e?.slug ?? 'evenement'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
