import { DahiraEvent } from '../models';

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escape = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/**
 * Fichier .ics (data: URL) pour « Me rappeler » : ouvre l'agenda du téléphone,
 * avec une alarme la veille. Aucun serveur nécessaire.
 */
export function buildIcsDataUrl(event: DahiraEvent, organizer: string, url: string): string {
  const end = event.endsAt ?? new Date(new Date(event.startsAt).getTime() + 2 * 3_600_000).toISOString();
  // Heure inconnue : événement « journée entière »
  const day = event.startsAt.slice(0, 10).replace(/-/g, '');
  const nextDay = new Date(Date.parse(event.startsAt.slice(0, 10)) + 86_400_000).toISOString().slice(0, 10).replace(/-/g, '');
  const when = event.timeTbc
    ? [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${nextDay}`]
    : [`DTSTART:${stamp(event.startsAt)}`, `DTEND:${stamp(end)}`];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DahiraConnect//FR',
    'BEGIN:VEVENT',
    `UID:${event.id}@dahiraconnect.sn`,
    `DTSTAMP:${stamp(event.startsAt)}`,
    ...when,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.place)}`,
    `DESCRIPTION:${escape(`${organizer}\n${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

/** Lien d'itinéraire Google Maps à partir du lieu, si aucun lien n'est fourni. */
export const buildMapLink = (event: DahiraEvent) =>
  event.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.place)}`;
