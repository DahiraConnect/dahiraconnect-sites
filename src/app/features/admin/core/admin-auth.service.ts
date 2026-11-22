import { Injectable, computed, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { Dahira } from '../../../core/models';
import { TenantService } from '../../../core/tenant/tenant.service';
import { supabase, supabaseConfigured } from './supabase';

export interface Membership {
  dahiraId: string;
  slug: string;
  role: 'owner' | 'editor';
  profile: Dahira;
}

/**
 * Connexion au back-office par e-mail, sans mot de passe : lien à toucher ou code à 6 chiffres
 * (le code n'apparaît que si le modèle d'e-mail personnalisé est actif, voir supabase/LISEZMOI.md).
 * Seules les personnes déjà inscrites comme responsables d'un dahira peuvent se connecter.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuth {
  private readonly tenant = inject(TenantService);
  private readonly _session = signal<Session | null>(null);
  private readonly _memberships = signal<Membership[]>([]);
  private ready?: Promise<void>;
  /** Dahira choisi (responsable de plusieurs dahiras), mémorisé sur cet appareil */
  private readonly selected = signal<string | null>(readSelected());

  readonly session = this._session.asReadonly();
  readonly email = computed(() => this._session()?.user.email ?? '');
  /** Prénom choisi dans « Mon profil », sinon le début de l'adresse e-mail */
  readonly displayName = computed(() => {
    const name = (this._session()?.user.user_metadata?.['name'] as string | undefined)?.trim();
    return name || this.email().split('@')[0];
  });
  readonly hasName = computed(() => !!(this._session()?.user.user_metadata?.['name'] as string | undefined)?.trim());
  /** Dahira géré : celui du site courant s'il fait partie des droits, sinon le premier */
  readonly memberships = this._memberships.asReadonly();
  readonly current = computed<Membership | undefined>(() => {
    const list = this._memberships();
    return (
      list.find((m) => m.dahiraId === this.selected()) ??
      list.find((m) => m.slug === this.tenant.dahira().slug) ??
      list[0]
    );
  });

  select(dahiraId: string): void {
    this.selected.set(dahiraId);
    try {
      localStorage.setItem(SELECTED_KEY, dahiraId);
    } catch {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
  }

  /** Session et droits chargés (une seule fois) */
  init(): Promise<void> {
    if (!supabaseConfigured) return Promise.resolve();
    this.ready ??= (async () => {
      const { data } = await supabase().auth.getSession();
      this._session.set(data.session);
      await this.loadMemberships();
      supabase().auth.onAuthStateChange((_event, session) => this._session.set(session));
    })();
    return this.ready;
  }

  /** Envoie le code à 6 chiffres. `false` si l'adresse n'est pas inscrite. */
  async sendCode(email: string, captchaToken?: string): Promise<'sent' | 'unknown' | 'captcha' | 'error'> {
    const { error } = await supabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/admin/connexion`, captchaToken },
    });
    if (!error) return 'sent';
    if (/captcha/i.test(error.message)) return 'captcha';
    return /signups not allowed|not found|otp_disabled/i.test(error.message) ? 'unknown' : 'error';
  }

  async verifyCode(email: string, token: string): Promise<boolean> {
    const { data, error } = await supabase().auth.verifyOtp({ email, token, type: 'email' });
    if (error || !data.session) return false;
    this._session.set(data.session);
    await this.loadMemberships();
    return true;
  }

  /** Enregistre le prénom affiché (journal, accueil de l'admin) */
  async updateName(name: string): Promise<boolean> {
    const { data, error } = await supabase().auth.updateUser({ data: { name: name.trim() } });
    if (error) return false;
    // Nouveau jeton : le prénom apparaît aussitôt dans le journal
    const { data: refreshed } = await supabase().auth.refreshSession();
    this._session.set(refreshed.session ?? this._session());
    return !!data.user;
  }

  async signOut(): Promise<void> {
    await supabase().auth.signOut();
    this._session.set(null);
    this._memberships.set([]);
  }

  private async loadMemberships(): Promise<void> {
    if (!this._session()) {
      this._memberships.set([]);
      return;
    }
    const { data } = await supabase()
      .from('dahira_admins')
      .select('role, dahira:dahiras(id, slug, profile)');
    type Row = { role: Membership['role']; dahira: { id: string; slug: string; profile: Dahira } };
    this._memberships.set(
      ((data ?? []) as unknown as Row[]).map((r) => ({
        dahiraId: r.dahira.id,
        slug: r.dahira.slug,
        role: r.role,
        profile: r.dahira.profile,
      })),
    );
  }

  /** Après modification du profil : garder la copie locale à jour */
  patchProfile(profile: Dahira): void {
    this._memberships.update((list) =>
      list.map((m) => (m.dahiraId === this.current()?.dahiraId ? { ...m, profile } : m)),
    );
  }
}

const SELECTED_KEY = 'dc-admin-dahira';
function readSelected(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}
