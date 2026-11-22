import { DialogService } from '../core/dialog.service';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { postsOf } from '../../../core/data/board';
import { relativeTime } from '../core/labels';
import { PublishService } from '../core/publish.service';
import { supabase } from '../core/supabase';
import { HelpTip } from '../ui/help-tip/help-tip';

interface Member {
  user_id: string;
  email: string;
  role: 'owner' | 'editor';
  person_id: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

/** Équipe : qui peut modifier le site. Ajout, rôle et retrait réservés aux propriétaires. */
@Component({
  selector: 'app-admin-team',
  imports: [FormsModule, RouterLink, HelpTip],
  templateUrl: './admin-team.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminTeamPage {
  private readonly dialogs = inject(DialogService);
  protected readonly auth = inject(AdminAuth);
  private readonly notices = inject(PublishService);

  protected readonly isOwner = computed(() => this.auth.current()?.role === 'owner');
  protected readonly myId = computed(() => this.auth.session()?.user.id);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected email = '';
  protected role: 'editor' | 'owner' = 'editor';
  protected readonly when = relativeTime;
  protected readonly people = computed(() =>
    [...(this.auth.current()?.board?.people ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  );
  protected readonly postsOf = (m: Member) => postsOf(this.auth.current()?.board, m.person_id);

  /** Propriétaire : relier un responsable à une personne du bureau */
  protected async linkPerson(m: Member, personId: string): Promise<void> {
    const { error } = await supabase().rpc('set_team_person', {
      d: this.auth.current()?.dahiraId,
      member: m.user_id,
      person: personId || null,
    });
    if (error) {
      this.notices.show({ kind: 'warn', text: 'Le lien a échoué. Réessayez.' });
      return;
    }
    this.members.reload();
    if (m.user_id === this.myId()) await this.auth.refresh();
    this.notices.show({ kind: 'ok', text: personId ? 'Poste au bureau relié.' : 'Lien retiré.' });
  }

  protected readonly members = resource({
    params: () => this.auth.current()?.dahiraId,
    loader: async ({ params }) => {
      const { data, error } = await supabase().rpc('list_team', { d: params });
      if (error) throw error;
      return data as Member[];
    },
  });

  protected async invite(): Promise<void> {
    const email = this.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.error.set('Vérifiez l’adresse e-mail.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const { data, error } = await supabase().functions.invoke<{ ok: boolean }>('team', {
      body: { dahiraId: this.auth.current()?.dahiraId, email, role: this.role },
    });
    this.busy.set(false);
    if (error || !data?.ok) {
      this.error.set('L’ajout a échoué. Réessayez.');
      return;
    }
    this.email = '';
    this.members.reload();
    this.notices.show({
      kind: 'ok',
      text: `${email} est ajouté. Dites-lui d’aller sur ${location.origin}/admin et de saisir son adresse.`,
    });
  }

  protected async setRole(m: Member, role: 'owner' | 'editor' | 'none'): Promise<void> {
    const confirmed = await this.dialogs.confirm(
      role === 'none'
        ? {
            title: `Retirer ${m.email} de l’équipe ?`,
            message: 'Cette personne ne pourra plus modifier le site.',
            confirmLabel: 'Retirer de l’équipe',
            tone: 'danger',
            icon: 'ph-user-minus',
          }
        : {
            title: role === 'owner' ? 'Nommer propriétaire ?' : 'Nommer éditeur ?',
            message:
              role === 'owner'
                ? `${m.email} pourra tout gérer : contenu, équipe et paramètres.`
                : `${m.email} pourra gérer l’agenda, la galerie et le bureau, mais plus l’équipe ni les paramètres.`,
            confirmLabel: role === 'owner' ? 'Nommer propriétaire' : 'Nommer éditeur',
            icon: role === 'owner' ? 'ph-crown-simple' : 'ph-user',
          },
    );
    if (!confirmed) return;
    this.busy.set(true);
    const { error } = await supabase().rpc('set_team_role', { d: this.auth.current()?.dahiraId, member: m.user_id, new_role: role });
    this.busy.set(false);
    if (error) {
      this.notices.show({
        kind: 'warn',
        text: /propriétaire/.test(error.message) ? 'Il doit rester au moins un propriétaire.' : 'La modification a échoué.',
      });
      return;
    }
    this.members.reload();
    this.notices.show({ kind: 'ok', text: role === 'none' ? 'Personne retirée de l’équipe.' : 'Rôle modifié.' });
  }
}
