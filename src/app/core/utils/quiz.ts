import { QuizLang, QuizQuestion } from '../models';

export interface PlayableQuestion {
  question: string;
  choices: string[];
  /** Index de la bonne réponse, après mélange */
  answer: number;
  explanation?: string;
}

/** Mélange de Fisher-Yates (aléatoire injectable pour les tests). */
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Mélange l'ordre des réponses de chaque question en suivant la bonne réponse. */
export function preparePlay(
  questions: readonly QuizQuestion[],
  random = Math.random,
  keepOrder = false,
  lang: QuizLang = 'fr',
): PlayableQuestion[] {
  return questions.map((source) => {
    // Version arabe : mêmes réponses dans le même ordre, donc même `answer`
    const q = lang === 'ar' && source.ar ? { ...source.ar, answer: source.answer } : source;
    const indexes = q.choices.map((_, i) => i);
    const order = keepOrder ? indexes : shuffle(indexes, random);
    return {
      question: q.question,
      choices: order.map((i) => q.choices[i]),
      answer: order.indexOf(q.answer),
      explanation: q.explanation,
    };
  });
}

const MESSAGES: Record<QuizLang, [string, string, string, string]> = {
  fr: ['Sans faute, bravo !', 'Très bien !', 'Bien joué, encore un effort.', 'Continuez d’apprendre, vous ferez mieux la prochaine fois.'],
  ar: ['ممتاز، بلا خطأ!', 'أحسنت!', 'جيد، واصل الجهد.', 'واصل التعلم، وستتحسن في المرة القادمة.'],
};

/** Message de fin selon la part de bonnes réponses. */
export function scoreMessage(score: number, total: number, lang: QuizLang = 'fr'): string {
  const ratio = total ? score / total : 0;
  const [perfect, great, good, keepGoing] = MESSAGES[lang];
  if (ratio === 1) return perfect;
  if (ratio >= 0.75) return great;
  if (ratio >= 0.5) return good;
  return keepGoing;
}
