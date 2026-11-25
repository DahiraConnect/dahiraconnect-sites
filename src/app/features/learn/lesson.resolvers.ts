import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { hasQuiz } from '../../core/models';
import { SeoData } from '../../core/seo/seo.service';

const find = (id: string | null) => inject(QuizService).withLesson(id ?? '');

/** Pas de leçon : le quiz du thème s'il existe, sinon la rubrique. */
export const lessonExistsGuard: CanActivateFn = (route) => {
  const id = route.paramMap.get('theme') ?? '';
  if (find(id)) return true;
  const quiz = inject(QuizService);
  return inject(Router).parseUrl(quiz.withQuiz(id) ? `/quiz/${id}` : '/apprendre');
};

export const lessonTitleResolver: ResolveFn<string> = (route) => {
  const theme = find(route.paramMap.get('theme'));
  return theme ? `Apprendre « ${theme.title} »` : 'Apprendre';
};

export const lessonSeoResolver: ResolveFn<SeoData> = (route) => {
  const theme = find(route.paramMap.get('theme'));
  if (!theme) return {};
  return { description: `${theme.description} ${hasQuiz(theme) ? 'À écouter, puis un petit quiz.' : 'À écouter.'}` };
};
