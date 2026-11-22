import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { EventService } from '../../core/data/event.service';
import { SeoData } from '../../core/seo/seo.service';
import { fmtDate, fmtTime } from '../../core/utils/dates';
import { TenantService } from '../../core/tenant/tenant.service';
import { eventLd, organizationLd } from '../../core/seo/structured-data';

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
        jsonLd: withTenant((dahira, site) => eventLd(event, dahira, site)),
      }
    : {};
};

/** Données structurées construites avec le dahira courant et son adresse publique */
function withTenant<T>(build: (dahira: ReturnType<TenantService['dahira']>, site: string) => T): T {
  const tenant = inject(TenantService);
  const site = tenant.dahira().siteUrl ?? new URL(tenant.absoluteUrl()).origin;
  return build(tenant.dahira(), site);
}

/** Accueil : le dahira en tant qu'Organization */
export const homeSeoResolver: ResolveFn<SeoData> = () => ({
  jsonLd: withTenant((dahira, site) => organizationLd(dahira, site)),
});
