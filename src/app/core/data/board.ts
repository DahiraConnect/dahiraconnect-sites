import { Board, Person } from '../models';

/** Un siège affiché : la personne, son rôle ici, et ses autres postes. */
export interface Seat {
  person: Person;
  role?: string;
  /** Autres postes de la même personne : 'Secrétaire général', 'Responsable · Organisation' */
  otherRoles: string[];
}

export interface CommissionView {
  id: string;
  name: string;
  description?: string;
  lead?: Seat;
  members: Seat[];
  count: number;
}

export interface BoardView {
  executive: Seat[];
  commissions: CommissionView[];
  /** Nombre de personnes distinctes */
  peopleCount: number;
}

const LEAD_ROLE = /^responsable/i;

/** 'Secrétaire général' / 'Secrétariat général' → même racine : on n'affiche que le rôle */
const stem = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().slice(0, 6);
const postLabel = (role: string | undefined, section: string) =>
  !role ? section : stem(role) === stem(section) ? role : `${role} · ${section}`;

/**
 * Relie les postes aux personnes et repère les cumuls de postes.
 * Le contexte (exécutif ou commission) sert à ne pas répéter le poste courant.
 */
export function buildBoardView(board: Board): BoardView {
  const people = new Map(board.people.map((p) => [p.id, p]));

  // Tous les postes de chaque personne, avec l'endroit où ils sont tenus
  const postsByPerson = new Map<string, { where: string; label: string }[]>();
  const addPost = (personId: string, where: string, label: string) => {
    postsByPerson.set(personId, [...(postsByPerson.get(personId) ?? []), { where, label }]);
  };
  for (const pos of board.executive) addPost(pos.personId, 'executive', pos.role ?? 'Bureau');
  for (const c of board.commissions) {
    for (const pos of c.members) {
      addPost(pos.personId, c.id, postLabel(pos.role, c.name));
    }
  }

  const seat = (personId: string, role: string | undefined, where: string): Seat | undefined => {
    const person = people.get(personId);
    if (!person) return undefined;
    const otherRoles = (postsByPerson.get(personId) ?? [])
      .filter((p) => p.where !== where)
      .map((p) => p.label);
    return { person, role, otherRoles };
  };
  const present = <T>(x: T | undefined): x is T => !!x;

  const commissions = board.commissions.map((c) => {
    const seats = c.members.map((m) => seat(m.personId, m.role, c.id)).filter(present);
    const flagged = c.members.findIndex((m) => m.lead && people.has(m.personId));
    const leadIndex =
      flagged >= 0
        ? c.members.slice(0, flagged).filter((m) => people.has(m.personId)).length
        : seats.findIndex((s) => s.role && LEAD_ROLE.test(s.role));
    const lead = leadIndex >= 0 ? seats[leadIndex] : undefined;
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      lead,
      members: seats.filter((_, i) => i !== leadIndex),
      count: seats.length,
    };
  });

  return {
    executive: board.executive.map((p) => seat(p.personId, p.role, 'executive')).filter(present),
    commissions,
    peopleCount: people.size,
  };
}

/** 'Baye Moussa Niang' → 'BN' (avatar sans photo) */
export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};
