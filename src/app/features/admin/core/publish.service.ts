import { Injectable, inject, signal } from '@angular/core';
import { fmtDate, fmtTime } from '../../../core/utils/dates';
import { PubStatus } from './status';
import { AdminAuth } from './admin-auth.service';
import { supabase } from './supabase';

/**
 * Après chaque enregistrement : demande la republication du site
 * (fonction Supabase `publish` → crochet de déploiement Cloudflare, environ 2 minutes).
 */
@Injectable({ providedIn: 'root' })
export class PublishService {
  private readonly auth = inject(AdminAuth);
  /** Message affiché en bas d'écran après un enregistrement */
  readonly notice = signal<{ kind: 'ok' | 'warn'; text: string } | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  async afterSave(what: string, status: PubStatus = 'published', publishAt: string | null = null): Promise<void> {
    const dahiraId = this.auth.current()?.dahiraId;
    let result: 'ok' | 'not-configured' | 'error' = 'error';
    try {
      const { data, error } = await supabase().functions.invoke<{ published: boolean; reason?: string }>('publish', {
        body: { dahiraId },
      });
      if (!error) result = data?.published ? 'ok' : data?.reason === 'no-hook' ? 'not-configured' : 'error';
    } catch {
      result = 'error';
    }
    const visible =
      status === 'draft'
        ? 'Brouillon : invisible sur le site.'
        : status === 'scheduled' && publishAt
          ? `Programmé : visible le ${fmtDate(publishAt)} à ${fmtTime(publishAt)}.`
          : 'Visible sur le site dans 2 à 3 minutes.';
    const texts = {
      ok: `${what}. ${visible}`,
      'not-configured': `${what}. La mise en ligne automatique n'est pas encore configurée.`,
      error: `${what}. La mise en ligne n'a pas répondu : elle se fera au prochain enregistrement.`,
    };
    // Brouillon ou programmé : le statut compte plus que la republication immédiate
    const quiet = status !== 'published';
    this.show({ kind: result === 'ok' || quiet ? 'ok' : 'warn', text: quiet ? `${what}. ${visible}` : texts[result] });
  }

  show(notice: { kind: 'ok' | 'warn'; text: string }): void {
    this.notice.set(notice);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.notice.set(null), 6000);
  }
}
