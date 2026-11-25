import { LessonLang } from '../../core/models';

/**
 * Libellés de la leçon. En wolof, les boutons restent en français
 * (public qui écoute plus qu'il ne lit) : seul le son est en wolof.
 */
const FR = {
  back: 'Tous les thèmes',
  language: 'Langue de la leçon',
  listen: 'Écouter',
  stop: 'Arrêter',
  previous: 'Précédent',
  next: 'Suivant',
  quiz: 'Faire le quiz',
  quizHint: 'Vous avez tout écouté. Vérifiez ce que vous avez retenu.',
  finish: 'Terminer',
  doneHint: 'Vous avez écouté toute la leçon.',
  contents: 'Dans cette leçon',
  restart: 'Recommencer la leçon',
  card: 'Carte',
  of: 'sur',
  source: 'D’après',
};

export type LessonText = typeof FR;

export const LESSON_TEXT: Record<LessonLang, LessonText> = {
  fr: FR,
  wo: FR,
  ar: {
    back: 'كل المواضيع',
    language: 'لغة الدرس',
    listen: 'استمع',
    stop: 'توقف',
    previous: 'السابق',
    next: 'التالي',
    quiz: 'ابدأ الاختبار',
    quizHint: 'استمعت إلى كل شيء. اختبر ما تعلمته.',
    finish: 'إنهاء',
    doneHint: 'استمعت إلى الدرس كله.',
    contents: 'في هذا الدرس',
    restart: 'أعد الدرس',
    card: 'بطاقة',
    of: 'من',
    source: 'المصدر:',
  },
};

/** Nom de chaque langue, écrit dans sa propre langue */
export const LANG_NAMES: Record<LessonLang, string> = { fr: 'Français', ar: 'العربية', wo: 'Wolof' };
