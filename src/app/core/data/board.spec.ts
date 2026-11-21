import { Board } from '../models';
import { buildBoardView, initials } from './board';

const board: Board = {
  people: [
    { id: 'a', name: 'Baye Moussa Niang' },
    { id: 'b', name: 'Coumbis Siby' },
    { id: 'c', name: 'Fatou Diop' },
  ],
  executive: [{ personId: 'a', role: 'Secrétaire général' }],
  commissions: [
    { id: 'orga', name: 'Organisation', description: '', members: [{ personId: 'c' }, { personId: 'a', role: 'Responsable' }] },
    { id: 'soc', name: 'Sociale', description: '', members: [{ personId: 'b', role: 'Responsable' }, { personId: 'a' }] },
  ],
};

describe('buildBoardView', () => {
  const view = buildBoardView(board);

  it('met le ou la responsable en avant, même s’il n’est pas en premier', () => {
    const orga = view.commissions[0];
    expect(orga.lead?.person.name).toBe('Baye Moussa Niang');
    expect(orga.members.map((m) => m.person.name)).toEqual(['Fatou Diop']);
    expect(orga.count).toBe(2);
  });

  it('indique les autres postes d’une personne qui en cumule plusieurs', () => {
    const lead = view.commissions[0].lead!;
    expect(lead.otherRoles).toEqual(['Secrétaire général', 'Sociale']);
    expect(view.executive[0].otherRoles).toEqual(['Responsable · Organisation', 'Sociale']);
  });

  it('n’affiche rien de plus pour quelqu’un qui n’a qu’un poste', () => {
    expect(view.commissions[0].members[0].otherRoles).toEqual([]);
  });

  it('compte les personnes distinctes', () => {
    expect(view.peopleCount).toBe(3);
  });

  it('met en avant la personne marquée « lead », quel que soit son rôle', () => {
    const v = buildBoardView({
      people: [{ id: 'x', name: 'Awa' }, { id: 'y', name: 'Baye Moussa Niang' }],
      executive: [],
      commissions: [
        { id: 'sg', name: 'Secrétariat', members: [{ personId: 'x' }, { personId: 'y', role: 'Secrétaire général', lead: true }] },
      ],
    });
    expect(v.commissions[0].lead?.person.name).toBe('Baye Moussa Niang');
    expect(v.commissions[0].members.map((m) => m.person.name)).toEqual(['Awa']);
  });

  it('n’écrit pas deux fois la même chose (« Trésorier · Trésorerie » → « Trésorier »)', () => {
    const v = buildBoardView({
      people: [{ id: 't', name: 'Mouhamed Fall' }],
      executive: [{ personId: 't', role: 'Trésorier' }],
      commissions: [{ id: 'tr', name: 'Trésorerie', members: [{ personId: 't', role: 'Trésorier', lead: true }] }],
    });
    expect(v.executive[0].otherRoles).toEqual(['Trésorier']);
  });

  it('calcule les initiales', () => {
    expect(initials('Baye Moussa Niang')).toBe('BN');
    expect(initials('Awa')).toBe('A');
  });
});
