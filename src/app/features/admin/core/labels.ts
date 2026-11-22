/** Boutons suivis (clé envoyée par le site) → libellé et icône pour le tableau de bord */
export const CLICK_LABELS: Record<string, { label: string; icon: string }> = {
  rejoindre_whatsapp: { label: 'Rejoindre sur WhatsApp', icon: 'ph-whatsapp-logo' },
  rejoindre_groupe: { label: 'Entrer dans le groupe WhatsApp', icon: 'ph-whatsapp-logo' },
  partage_whatsapp: { label: 'Partages sur WhatsApp', icon: 'ph-share-network' },
  appel: { label: 'Appels', icon: 'ph-phone' },
  itineraire: { label: 'Itinéraires', icon: 'ph-map-pin' },
  ajout_agenda: { label: 'Ajouts à l’agenda du téléphone', icon: 'ph-calendar-plus' },
  copie_numero_soutien: { label: 'Numéros Wave / Orange Money copiés', icon: 'ph-hand-heart' },
  lecture_video: { label: 'Vidéos lancées', icon: 'ph-play-circle' },
  quiz_commence: { label: 'Quiz commencés', icon: 'ph-exam' },
  inscription_evenement: { label: 'Inscriptions aux événements', icon: 'ph-hand-waving' },
  abonnement_agenda: { label: 'Abonnements à l’agenda', icon: 'ph-calendar-plus' },
  ecoute_annonce: { label: 'Écoutes de l’annonce', icon: 'ph-speaker-high' },
  suivre_chaine: { label: 'Abonnements à la chaîne WhatsApp', icon: 'ph-bell' },
  demande_annonces: { label: 'Demandes pour recevoir les annonces', icon: 'ph-bell' },
  reseau_tiktok: { label: 'Visites TikTok', icon: 'ph-tiktok-logo' },
  reseau_facebook: { label: 'Visites Facebook', icon: 'ph-facebook-logo' },
  reseau_instagram: { label: 'Visites Instagram', icon: 'ph-instagram-logo' },
  reseau_youtube: { label: 'Visites YouTube', icon: 'ph-youtube-logo' },
};

export const clickLabel = (key: string) => CLICK_LABELS[key] ?? { label: key, icon: 'ph-cursor-click' };

/** Pages fixes du site */
const PAGE_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/le-dahira': 'Qui sommes-nous',
  '/le-dahira/notre-guide': 'Notre guide',
  '/le-dahira/bureau': 'Le bureau',
  '/le-dahira/charte': 'La charte',
  '/agenda': 'Agenda',
  '/galerie': 'Galerie',
  '/rejoindre': 'Rejoindre',
  '/quiz': 'Quiz',
};

/** '/agenda/ziar-2026' → titre de l'événement si connu */
export function pageLabel(path: string, titles: Map<string, string>): string {
  return PAGE_LABELS[path] ?? titles.get(path) ?? path;
}

/** Journal : action → phrase courte et icône */
export const AUDIT_ACTIONS: Record<string, { verb: string; icon: string }> = {
  insert: { verb: 'a ajouté', icon: 'ph-plus-circle' },
  update: { verb: 'a modifié', icon: 'ph-pencil-simple' },
  delete: { verb: 'a supprimé', icon: 'ph-trash' },
  publish: { verb: 'a publié', icon: 'ph-check-circle' },
  unpublish: { verb: 'a mis en brouillon', icon: 'ph-pencil-simple-line' },
  schedule: { verb: 'a programmé', icon: 'ph-clock' },
  team: { verb: 'équipe :', icon: 'ph-users-three' },
};

export interface AuditEntry {
  id: number;
  user_email: string | null;
  user_name?: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  label: string | null;
  created_at: string;
}

/** « a ajouté l’événement « Ziar » », « a modifié : Bureau » */
export function describeAudit(e: AuditEntry): string {
  const verb = AUDIT_ACTIONS[e.action]?.verb ?? e.action;
  if (e.entity === 'event' || e.entity === 'album') {
    return `${verb} ${e.entity === 'event' ? 'l’événement' : 'l’album'} « ${e.label ?? '?'} »`;
  }
  return e.entity === 'team' ? (e.label ?? 'équipe modifiée') : `${verb} : ${e.label ?? e.entity}`;
}

/** « à l'instant », « il y a 5 min », « il y a 3 h », « hier », « le 12 nov. » */
export function relativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  if (h < 48) return 'hier';
  return `le ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Africa/Dakar' }).format(new Date(iso))}`;
}

/** Qui : le prénom choisi, sinon le début de l'adresse e-mail */
export const whoDid = (e: Pick<AuditEntry, 'user_email' | 'user_name'>) => e.user_name || shortEmail(e.user_email);

/** 'aminata.ndiaye@gmail.com' → 'aminata.ndiaye' (plus court à lire) */
export const shortEmail = (email: string | null) => (email ? email.split('@')[0] : 'Système');
