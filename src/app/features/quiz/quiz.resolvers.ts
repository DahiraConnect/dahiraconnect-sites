import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { SeoData } from '../../core/seo/seo.service';

const find = (id: string | null) => inject(QuizService).byId(id ?? '');

/** Thème inconnu → liste des thèmes. */
export const quizExistsGuard: CanActivateFn = (route) =>
  !!find(route.paramMap.get('theme')) || inject(Router).parseUrl('/quiz');

export const quizTitleResolver: ResolveFn<string> = (route) => {
  const theme = find(route.paramMap.get('theme'));
  return theme ? `Quiz « ${theme.title} »` : 'Quiz';
};

export const quizSeoResolver: ResolveFn<SeoData> = (route) => {
  const theme = find(route.paramMap.get('theme'));
  return theme ? { description: `${theme.description} ${theme.questions.length} questions. À ton tour !` } : {};
};
