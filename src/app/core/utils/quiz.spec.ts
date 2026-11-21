import { preparePlay, scoreMessage, shuffle } from './quiz';

/** Aléatoire déterministe pour les tests */
const seeded = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('quiz', () => {
  it('mélange sans perdre ni dupliquer d’élément', () => {
    const out = shuffle([1, 2, 3, 4, 5], seeded([0.1, 0.9, 0.5, 0.3]));
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('suit la bonne réponse après mélange', () => {
    const [q] = preparePlay(
      [{ question: 'Fondation ?', choices: ['1999', '2012', '1985'], answer: 0 }],
      seeded([0.99, 0.0]),
    );
    expect(q.choices[q.answer]).toBe('1999');
    expect([...q.choices].sort()).toEqual(['1985', '1999', '2012']);
  });

  it('garde l’ordre des réponses si demandé (Farata avant Sunna)', () => {
    const [q] = preparePlay(
      [{ question: 'Laver le visage', choices: ['Farata', 'Sunna'], answer: 0 }],
      seeded([0.0]),
      true,
    );
    expect(q.choices).toEqual(['Farata', 'Sunna']);
    expect(q.answer).toBe(0);
  });

  it('joue la version arabe avec la même bonne réponse', () => {
    const [q] = preparePlay(
      [{ question: 'Laver le visage', choices: ['Farata', 'Sunna'], answer: 0, ar: { question: 'غسل الوجه', choices: ['فرض', 'سنة'] } }],
      seeded([0.0]),
      true,
      'ar',
    );
    expect(q.question).toBe('غسل الوجه');
    expect(q.choices[q.answer]).toBe('فرض');
  });

  it('adapte le message au score', () => {
    expect(scoreMessage(8, 8)).toBe('Sans faute, bravo !');
    expect(scoreMessage(6, 8)).toBe('Très bien !');
    expect(scoreMessage(4, 8)).toContain('Bien joué');
    expect(scoreMessage(1, 8)).toContain('Continuez');
  });
});
