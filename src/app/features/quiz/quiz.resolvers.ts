import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { QuizService } from '../../core/data/quiz.service';
import { SeoData } from '../../core/seo/seo.service';

const find = (id: string | null) => inject(QuizService).withQuiz(id ?? '');

/** Thème inconnu ou sans quiz → rubrique « Apprendre ». */
export const quizExistsGuard: CanActivateFn = (route) =>
  !!find(route.paramMap.get('theme')) || inject(Router).parseUrl('/apprendre');

export const quizTitleResolver: ResolveFn<string> = (route) => {
  const theme = find(route.paramMap.get('theme'));
  return theme ? `Quiz « ${theme.title} »` : 'Quiz';
};

export const quizSeoResolver: ResolveFn<SeoData> = (route) => {
  const theme = find(route.paramMap.get('theme'));
  return theme ? { description: `${theme.description} ${theme.questions.length} questions. À ton tour !` } : {};
};
