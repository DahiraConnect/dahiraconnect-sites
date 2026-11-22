import { Dahira, DahiraEvent } from '../models';

const absolute = (siteUrl: string, path?: string) => (path ? new URL(path, siteUrl).toString() : undefined);

/** schema.org Organization : le dahira (nom, logo, adresse, réseaux). */
export function organizationLd(dahira: Dahira, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: dahira.name,
    alternateName: dahira.nameArabic,
    url: siteUrl,
    logo: absolute(siteUrl, dahira.logoUrl),
    description: dahira.motto,
    foundingDate: String(dahira.foundedYear),
    foundingLocation: dahira.foundedPlace,
    telephone: dahira.contact.phone,
    address: { '@type': 'PostalAddress', addressLocality: dahira.contact.address, addressCountry: 'SN' },
    sameAs: (dahira.social ?? []).map((s) => s.url),
  };
}

/** schema.org Event : un rendez-vous du dahira (date seule si l'heure est à confirmer). */
export function eventLd(event: DahiraEvent, dahira: Dahira, siteUrl: string) {
  const day = (iso: string) => iso.slice(0, 10);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.timeTbc ? day(event.startsAt) : event.startsAt,
    endDate: event.endsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: event.place, address: { '@type': 'PostalAddress', addressLocality: event.place, addressCountry: 'SN' } },
    image: (event.images ?? []).map((img) => absolute(siteUrl, img.url)),
    description: event.description,
    url: absolute(siteUrl, `/agenda/${event.slug}/`),
    organizer: { '@type': 'Organization', name: dahira.name, url: siteUrl },
  };
}
