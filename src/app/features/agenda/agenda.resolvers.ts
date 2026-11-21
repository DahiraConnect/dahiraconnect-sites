import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { EventService } from '../../core/data/event.service';
import { SeoData } from '../../core/seo/seo.service';
import { fmtDate, fmtTime } from '../../core/utils/dates';

const find = (slug: string | null) => inject(EventService).bySlug(slug ?? '');

/** Slug inconnu → retour à la liste. */
export const eventExistsGuard: CanActivateFn = (route) =>
  !!find(route.paramMap.get('slug')) || inject(Router).parseUrl('/agenda');

export const eventTitleResolver: ResolveFn<string> = (route) =>
  find(route.paramMap.get('slug'))?.title ?? '';

export const eventSeoResolver: ResolveFn<SeoData> = (route) => {
  const event = find(route.paramMap.get('slug'));
  return event
    ? {
        description: event.timeTbc
          ? `${fmtDate(event.startsAt)} · ${event.place}`
          : `${fmtDate(event.startsAt)} à ${fmtTime(event.startsAt)} · ${event.place}`,
        image: event.images?.[0]?.url,
      }
    : {};
};
