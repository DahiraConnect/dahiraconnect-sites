/** Modules du back-office (menu « à la Odoo » : une grille, accessible depuis toutes les pages) */
export interface AdminModule {
  path: string;
  icon: string;
  title: string;
  text: string;
  /** Réservé aux propriétaires */
  ownerOnly?: boolean;
  /** Couleur de la pastille (variable CSS) */
  tone: 'green' | 'gold' | 'blue' | 'rose' | 'sand';
}

export const ADMIN_MODULES: AdminModule[] = [
  { path: '/admin', icon: 'ph-squares-four', title: 'Tableau de bord', text: 'Vue d’ensemble', tone: 'green' },
  { path: '/admin/agenda', icon: 'ph-calendar-blank', title: 'Agenda', text: 'Rendez-vous', tone: 'gold' },
  { path: '/admin/galerie', icon: 'ph-images', title: 'Galerie', text: 'Photos et vidéos', tone: 'blue' },
  { path: '/admin/annonce', icon: 'ph-megaphone-simple', title: 'Annonce', text: 'Message important', tone: 'rose' },
  { path: '/admin/bureau', icon: 'ph-users-three', title: 'Bureau', text: 'Membres, commissions', tone: 'green' },
  { path: '/admin/textes', icon: 'ph-text-aa', title: 'Textes', text: 'Accueil, histoire, charte', tone: 'sand' },
  { path: '/admin/equipe', icon: 'ph-user-gear', title: 'Équipe', text: 'Qui peut modifier', tone: 'blue' },
  { path: '/admin/parametres', icon: 'ph-gear-six', title: 'Paramètres', text: 'Identité, couleurs', tone: 'sand', ownerOnly: true },
  { path: '/admin/activite', icon: 'ph-clock-counter-clockwise', title: 'Historique', text: 'Qui a fait quoi', tone: 'gold' },
];
