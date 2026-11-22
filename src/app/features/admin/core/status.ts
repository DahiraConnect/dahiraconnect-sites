export type PubStatus = 'draft' | 'published' | 'scheduled';

export const STATUS_INFO: Record<PubStatus, { label: string; icon: string; help: string }> = {
  draft: { label: 'Brouillon', icon: 'ph-pencil-simple-line', help: 'Invisible sur le site. Vous pourrez le publier plus tard.' },
  published: { label: 'Publié', icon: 'ph-check-circle', help: 'Visible sur le site 2 à 3 minutes après l’enregistrement.' },
  scheduled: { label: 'Programmé', icon: 'ph-clock', help: 'Apparaîtra tout seul sur le site à la date et l’heure choisies.' },
};

/** Statut affiché : un contenu programmé dont la date est passée est publié */
export function effectiveStatus(status: PubStatus, publishAt: string | null, now = Date.now()): PubStatus {
  return status === 'scheduled' && publishAt && new Date(publishAt).getTime() <= now ? 'published' : status;
}
