import { Lesson } from '../models';
import { cardIn, lessonLangs } from './lesson';

const lesson = (cards: Lesson['cards']): Lesson => ({ cards });

describe('lesson', () => {
  it('propose toujours le français', () => {
    expect(lessonLangs(lesson([{ title: 'Carte' }]))).toEqual(['fr']);
  });

  it('propose l’arabe seulement si toutes les cartes sont traduites', () => {
    const one = { title: 'Un', ar: { title: 'واحد' } };
    expect(lessonLangs(lesson([one, { title: 'Deux' }]))).toEqual(['fr']);
    expect(lessonLangs(lesson([one, { title: 'Deux', ar: { title: 'اثنان' } }]))).toEqual(['fr', 'ar']);
  });

  it('propose le wolof seulement si chaque carte a son audio wolof', () => {
    const one = { title: 'Un', wo: { audio: '/a.m4a' } };
    expect(lessonLangs(lesson([one, { title: 'Deux', wo: { title: 'Ñaar' } }]))).toEqual(['fr']);
    expect(lessonLangs(lesson([one, { title: 'Deux', wo: { audio: '/b.m4a' } }]))).toEqual(['fr', 'wo']);
  });

  it('wolof sans texte : texte français, audio wolof', () => {
    const card = { title: 'Un', text: 'Texte', audio: '/fr.m4a', wo: { audio: '/wo.m4a' } };
    expect(cardIn(card, 'wo')).toEqual({ title: 'Un', text: 'Texte', audio: '/wo.m4a', image: undefined, imageAlt: undefined });
  });

  it('ne reprend jamais le son d’une autre langue', () => {
    const card = { title: 'Un', audio: '/fr.m4a', ar: { title: 'واحد', text: 'نص' } };
    expect(cardIn(card, 'ar')).toEqual({ title: 'واحد', text: 'نص', audio: undefined, image: undefined, imageAlt: undefined });
  });
});
