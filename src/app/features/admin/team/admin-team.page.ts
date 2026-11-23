import { DialogService } from '../core/dialog.service';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { postsOf } from '../../../core/data/board';
import { relativeTime } from '../core/labels';
import { PublishService } from '../core/publish.service';
import { roleFromDb, roleToDb, supabase } from '../core/supabase';
import { HelpTip } from '../ui/help-tip/help-tip';
import { PersonChoice, PersonPicker } from '../ui/person-picker/person-picker';
import { DahiraDocStore } from '../core/dahira-doc.store';

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
  imports: [PersonPicker, FormsModule, RouterLink, HelpTip],
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
  private readonly store = inject(DahiraDocStore);
  protected readonly person = signal<PersonChoice>(null);
  /** Poste au bureau exécutif d'une personne nouvelle (facultatif) */
  protected newPost = '';

  /** Nom de la personne du bureau reliée, sinon l'adresse e-mail */
  protected readonly nameOf = (m: Member) =>
    this.auth.current()?.board?.people.find((p) => p.id === m.person_id)?.name ?? m.email;

  /** Un propriétaire gère les éditeurs et lui-même, jamais un autre propriétaire */
  protected readonly canManage = (m: Member) =>
    this.isOwner() && (m.role === 'editor' || m.user_id === this.myId());

  /** Personne nouvelle : ajoutée au bureau (avec son poste éventuel) avant l'invitation */
  private async ensurePerson(): Promise<string | null> {
    const choice = this.person();
    if (!choice) return null;
    if (choice.kind === 'existing') return choice.id;
    await this.store.load(true);
    const board = this.store.board();
    if (!board) return null;
    const id = `p-${crypto.randomUUID().slice(0, 8)}`;
    const post = this.newPost.trim();
    const ok = await this.store.saveBoard(
      {
        ...board,
        people: [...board.people, { id, name: choice.name }],
        executive: post ? [...board.executive, { personId: id, role: post }] : board.executive,
      },
      'Personne ajoutée au bureau',
    );
    if (!ok) return null;
    await this.auth.refresh();
    return id;
  }

  /** Propriétaire : relier un responsable à une personne du bureau */
  protected async linkPerson(m: Member, personId: string): Promise<void> {
    const { error } = await supabase().rpc('site_lier_poste', {
      d: this.auth.current()?.dahiraId,
      membre: m.user_id,
      personne: personId || null,
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
      const { data, error } = await supabase().rpc('site_lister_equipe', { d: params });
      if (error) throw error;
      type Row = {
        profile_id: string;
        email: string | null;
        telephone: string | null;
        role: string;
        personne_bureau: string | null;
        created_at: string;
        derniere_connexion: string | null;
      };
      return (data as Row[]).map(
        (r): Member => ({
          user_id: r.profile_id,
          // Compte créé sur le mobile : pas d'e-mail, on montre le numéro
          email: r.email ?? (r.telephone ? `+${r.telephone.replace(/^\+/, '')}` : 'Compte sans e-mail'),
          role: roleFromDb(r.role),
          person_id: r.personne_bureau,
          created_at: r.created_at,
          last_sign_in_at: r.derniere_connexion,
        }),
      );
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
    const personId = await this.ensurePerson();
    const { data, error } = await supabase().functions.invoke<{ ok: boolean }>('site-equipe', {
      body: { dahiraId: this.auth.current()?.dahiraId, email, role: this.role, personId },
    });
    this.busy.set(false);
    if (error || !data?.ok) {
      const code = await (error as { context?: Response } | null)?.context?.json?.().then((b: unknown) => b && typeof b === 'object' && 'error' in b && typeof b.error === 'string' ? b.error : undefined).catch(() => undefined);
      this.error.set(
        code === 'owner_exists'
          ? 'Cette adresse est déjà propriétaire : un autre propriétaire ne peut pas la modifier.'
          : 'L’ajout a échoué. Réessayez.',
      );
      return;
    }
    const who = this.person()?.name ?? email;
    this.email = '';
    this.newPost = '';
    this.person.set(null);
    await this.auth.refresh();
    this.members.reload();
    this.notices.show({
      kind: 'ok',
      text: `${who} est ajouté. Dites-lui d’aller sur ${location.origin}/admin et de saisir son adresse.`,
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
    const { error } = await supabase().rpc('site_changer_role', {
      d: this.auth.current()?.dahiraId,
      membre: m.user_id,
      nouveau_role: roleToDb(role),
    });
    this.busy.set(false);
    if (error) {
      this.notices.show({
        kind: 'warn',
        text: /proprietaire_protege/.test(error.message)
          ? 'Un propriétaire ne peut pas être modifié par un autre propriétaire.'
          : /dernier_proprietaire/.test(error.message)
            ? 'Il doit rester au moins un propriétaire.'
            : 'La modification a échoué.',
      });
      return;
    }
    this.members.reload();
    this.notices.show({ kind: 'ok', text: role === 'none' ? 'Personne retirée de l’équipe.' : 'Rôle modifié.' });
  }
}
