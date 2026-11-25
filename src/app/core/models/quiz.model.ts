/** Une question : `answer` = index de la bonne réponse dans `choices` (l'ordre est mélangé à l'affichage). */
export interface QuizQuestion {
  question: string;
  choices: string[];
  answer: number;
  /** Phrase d'explication affichée après la réponse */
  explanation?: string;
  /** Illustration de la question (ex. '/assets/quiz/priere-takbir.svg') et sa description */
  image?: string;
  imageAlt?: string;
  /** Une image par réponse, dans le même ordre que `choices` (répondre en regardant) */
  choiceImages?: string[];
  /** Version arabe (mêmes réponses, dans le même ordre : `answer` reste valable) */
  ar?: { question: string; choices: string[]; explanation?: string };
}

/** Langues d'une leçon. Le wolof est surtout oral : il compte s'il y a un audio par carte. */
export type LessonLang = 'fr' | 'ar' | 'wo';

/** Texte et son d'une carte dans une autre langue que le français */
export interface LessonVersion {
  title?: string;
  text?: string;
  /** Enregistrement par une vraie voix (ex. '/assets/lecons/wazifa/1-wo.m4a') */
  audio?: string;
}

/** Une carte de leçon : une idée courte, une image, un son. */
export interface LessonCard {
  title: string;
  text?: string;
  /** Enregistrement en français (sinon lecture par le téléphone) */
  audio?: string;
  image?: string;
  imageAlt?: string;
  ar?: LessonVersion;
  wo?: LessonVersion;
}

/** Leçon à écouter avant le quiz (facultative) */
export interface Lesson {
  cards: LessonCard[];
}

/** Un thème de la rubrique « Apprendre » : une leçon, un quiz, ou les deux. */
export interface QuizTheme {
  /** Adresses : /apprendre/<id> (leçon) et /quiz/<id> (quiz) */
  id: string;
  title: string;
  description: string;
  /** Icône Phosphor : 'ph-scroll' */
  icon?: string;
  /** Source des réponses, affichée au joueur : « Mukhtasar d'Al-Akhdari (rite malikite) » */
  source?: string;
  /** Ne pas mélanger les réponses (ex. « Farata » toujours avant « Sunna ») */
  keepOrder?: boolean;
  /** Titre et description en arabe (le thème est alors proposé en arabe si toutes ses questions le sont) */
  ar?: { title: string; description: string };
  questions: QuizQuestion[];
  /** Leçon à écouter avant de jouer */
  lesson?: Lesson;
}

export type QuizLang = 'fr' | 'ar';

/** Le thème peut-il être joué en arabe ? */
export const hasArabic = (theme: QuizTheme) => !!theme.ar && theme.questions.every((q) => !!q.ar);

/** Le thème a-t-il une leçon ? */
export const hasLesson = (theme: QuizTheme) => !!theme.lesson?.cards.length;

/** Le thème a-t-il un quiz ? */
export const hasQuiz = (theme: QuizTheme) => theme.questions.length > 0;

export interface Quiz {
  intro: string;
  themes: QuizTheme[];
}
