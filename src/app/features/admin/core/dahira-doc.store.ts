import { Injectable, inject, signal } from '@angular/core';
import { Board, Dahira, PageContent } from '../../../core/models';
import { AdminAuth } from './admin-auth.service';
import { PublishService } from './publish.service';
import { supabase } from './supabase';

/**
 * Documents uniques du dahira (profil, bureau) : chargés une fois, modifiés en mémoire,
 * enregistrés d'un bloc.
 */
@Injectable({ providedIn: 'root' })
export class DahiraDocStore {
  private readonly auth = inject(AdminAuth);
  private readonly publish = inject(PublishService);

  readonly board = signal<Board | null>(null);
  readonly profile = signal<Dahira | null>(null);
  readonly content = signal<PageContent | null>(null);
  readonly error = signal(false);
  private loadedFor?: string;
  /** Version lue : l'enregistrement est refusé si quelqu'un a modifié le dahira entre-temps */
  private version = 0;

  async load(force = false): Promise<void> {
    const id = this.auth.current()?.dahiraId;
    if (!id || (!force && this.loadedFor === id)) return;
    const { data, error } = await supabase()
      .from('sites')
      .select('profile:profil, board:bureau, content:contenu, version')
      .eq('dahira_id', id)
      .single();
    this.error.set(!!error);
    if (error) return;
    this.loadedFor = id;
    this.board.set(data.board as Board);
    this.profile.set(data.profile as Dahira);
    this.content.set(data.content as PageContent);
    this.version = data.version as number;
  }

  async saveBoard(board: Board, what: string): Promise<boolean> {
    const ok = await this.update({ board });
    if (ok) {
      this.board.set(board);
      void this.publish.afterSave(what);
    }
    return ok;
  }

  async saveContent(content: PageContent, what: string): Promise<boolean> {
    const ok = await this.update({ content });
    if (ok) {
      this.content.set(content);
      void this.publish.afterSave(what);
    }
    return ok;
  }

  async saveProfile(profile: Dahira, what: string): Promise<boolean> {
    const ok = await this.update({ profile });
    if (ok) {
      this.profile.set(profile);
      this.auth.patchProfile(profile);
      void this.publish.afterSave(what);
    }
    return ok;
  }

  /** Modification refusée car un autre responsable a enregistré entre-temps */
  readonly conflict = signal(false);

  private async update(patch: { board?: Board; content?: PageContent; profile?: Dahira }): Promise<boolean> {
    const id = this.auth.current()?.dahiraId;
    if (!id) return false;
    // Colonnes de la base commune (table sites)
    const row: Record<string, unknown> = {};
    if (patch.board) row['bureau'] = patch.board;
    if (patch.content) row['contenu'] = patch.content;
    if (patch.profile) row['profil'] = patch.profile;
    const { data, error } = await supabase()
      .from('sites')
      .update(row)
      .eq('dahira_id', id)
      .eq('version', this.version)
      .select('version');
    if (error) return false;
    if (!data?.length) {
      // Quelqu'un d'autre a enregistré : on recharge pour ne rien écraser
      this.conflict.set(true);
      this.publish.show({
        kind: 'warn',
        text: 'Un autre responsable vient de modifier ces informations. La page a été rechargée : refaites votre modification.',
      });
      await this.load(true);
      return false;
    }
    this.conflict.set(false);
    this.version = data[0].version as number;
    return true;
  }
}
