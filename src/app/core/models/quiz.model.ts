/** Une question : `answer` = index de la bonne réponse dans `choices` (l'ordre est mélangé à l'affichage). */
export interface QuizQuestion {
  question: string;
  choices: string[];
  answer: number;
  /** Phrase d'explication affichée après la réponse */
  explanation?: string;
  /** Version arabe (mêmes réponses, dans le même ordre : `answer` reste valable) */
  ar?: { question: string; choices: string[]; explanation?: string };
}

export interface QuizTheme {
  /** Adresse : /quiz/<id> */
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
}

export type QuizLang = 'fr' | 'ar';

/** Le thème peut-il être joué en arabe ? */
export const hasArabic = (theme: QuizTheme) => !!theme.ar && theme.questions.every((q) => !!q.ar);

export interface Quiz {
  intro: string;
  themes: QuizTheme[];
}
