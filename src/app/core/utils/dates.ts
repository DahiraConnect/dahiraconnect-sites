/** Fuseau de référence des dahiras (Sénégal, UTC+0 sans heure d'été). */
export const TIME_ZONE = 'Africa/Dakar';

const DAY_MS = 86_400_000;

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: TIME_ZONE, ...options });

const dayFmt = fmt({ day: '2-digit' });
const monthShortFmt = fmt({ month: 'short' });
const weekdayFmt = fmt({ weekday: 'long' });
const fullDateFmt = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const dayMonthFmt = fmt({ day: 'numeric', month: 'long' });
const monthYearFmt = fmt({ month: 'long', year: 'numeric' });
const timeFmt = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dateKeyFmt = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Clé 'AAAA-MM-JJ' du jour calendaire à Dakar. */
const dayKey = (d: Date) => {
  const parts = Object.fromEntries(dateKeyFmt.formatToParts(d).map((p) => [p.type, p.value]));
  return Date.UTC(+parts['year'], +parts['month'] - 1, +parts['day']);
};

/** Nombre de jours calendaires avant la date (0 = aujourd'hui ou passé). */
export const daysUntil = (iso: string, now = new Date()) =>
  Math.max(0, Math.round((dayKey(new Date(iso)) - dayKey(now)) / DAY_MS));

/** '05' */
export const fmtDay = (iso: string) => dayFmt.format(new Date(iso));

/** 'DÉC.' */
export const fmtMonthShort = (iso: string) => monthShortFmt.format(new Date(iso)).toUpperCase();

/** 'Samedi' */
export const fmtWeekday = (iso: string) => capitalize(weekdayFmt.format(new Date(iso)));

/** '25 octobre 2026' */
export const fmtDate = (iso: string) => fullDateFmt.format(new Date(iso));

/** '14 février' */
export const fmtDayMonth = (iso: string) => dayMonthFmt.format(new Date(iso));

/** 'Novembre 2026' */
export const fmtMonthYear = (iso: string) => capitalize(monthYearFmt.format(new Date(iso)));

/** '20 h 30', '16 h' */
export const fmtTime = (iso: string) => {
  const [h, m] = timeFmt.format(new Date(iso)).split(':');
  return m === '00' ? `${+h} h` : `${+h} h ${m}`;
};

/** '10 h – 22 h' ou '20 h 30' */
export const fmtTimeRange = (startIso: string, endIso?: string) =>
  endIso ? `${fmtTime(startIso)} – ${fmtTime(endIso)}` : fmtTime(startIso);

/** 'Aujourd'hui', 'Demain', 'Dans 14 jours' */
export const fmtCountdown = (days: number) =>
  days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `Dans ${days} jours`;

/** Clé de mois 'AAAA-MM' (à Dakar) pour regrouper les événements. */
export const monthKey = (iso: string) => {
  const parts = Object.fromEntries(dateKeyFmt.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts['year']}-${parts['month']}`;
};
