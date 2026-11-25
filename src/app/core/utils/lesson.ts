import { Lesson, LessonCard, LessonLang } from '../models';

/** Ce qui s'affiche et se joue pour une carte, dans une langue */
export interface ShownCard {
  title: string;
  text?: string;
  audio?: string;
  image?: string;
  imageAlt?: string;
}

/**
 * Langues proposées pour une leçon : le français toujours ;
 * l'arabe si chaque carte a son titre arabe ;
 * le wolof si chaque carte a son audio wolof (public qui écoute plus qu'il ne lit).
 */
export function lessonLangs(lesson: Lesson): LessonLang[] {
  const langs: LessonLang[] = ['fr'];
  if (lesson.cards.every((c) => !!c.ar?.title)) langs.push('ar');
  if (lesson.cards.every((c) => !!c.wo?.audio)) langs.push('wo');
  return langs;
}

/**
 * Carte dans la langue choisie. Le son n'est jamais pris dans une autre langue.
 * Wolof sans texte écrit : on montre le texte français, l'audio reste en wolof.
 */
export function cardIn(card: LessonCard, lang: LessonLang): ShownCard {
  const { image, imageAlt } = card;
  if (lang === 'fr') return { title: card.title, text: card.text, audio: card.audio, image, imageAlt };
  const v = card[lang] ?? {};
  return {
    title: v.title ?? card.title,
    text: v.title ? v.text : card.text,
    audio: v.audio,
    image,
    imageAlt,
  };
}
