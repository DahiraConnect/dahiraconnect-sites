import { Injectable, inject, signal } from '@angular/core';
import { Board, Dahira } from '../../../core/models';
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
  readonly error = signal(false);
  private loadedFor?: string;

  async load(force = false): Promise<void> {
    const id = this.auth.current()?.dahiraId;
    if (!id || (!force && this.loadedFor === id)) return;
    const { data, error } = await supabase().from('dahiras').select('profile, board').eq('id', id).single();
    this.error.set(!!error);
    if (error) return;
    this.loadedFor = id;
    this.board.set(data.board as Board);
    this.profile.set(data.profile as Dahira);
  }

  async saveBoard(board: Board, what: string): Promise<boolean> {
    const ok = await this.update({ board });
    if (ok) {
      this.board.set(board);
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

  private async update(patch: Record<string, unknown>): Promise<boolean> {
    const id = this.auth.current()?.dahiraId;
    if (!id) return false;
    const { error } = await supabase().from('dahiras').update(patch).eq('id', id);
    return !error;
  }
}
