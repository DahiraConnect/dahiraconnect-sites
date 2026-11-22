// Calendrier en ligne du dahira (/agenda.ics), régénéré à chaque build :
// une fois abonné, le téléphone reçoit tout seul les nouveaux rendez-vous.

/** Texte ICS : échappe \ ; , et retours à la ligne */
const esc = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lignes de 75 octets au plus (norme RFC 5545), suite précédée d'une espace */
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const parts = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (start === 0 ? 75 : 74), bytes.length);
    // Ne pas couper au milieu d'un caractère UTF-8
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
  }
  return parts.join('\r\n ');
}

const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const day = (iso) => iso.slice(0, 10).replace(/-/g, '');
const nextDay = (iso) => day(new Date(new Date(iso.slice(0, 10)).getTime() + 86_400_000).toISOString());

export function buildIcs(dahira, events, siteUrl, now = new Date()) {
  const host = new URL(siteUrl || 'https://dahiraconnect.sn').host;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//DahiraConnect//${esc(dahira.shortName)}//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(dahira.name)}`,
    `X-WR-CALDESC:${esc(`Les rendez-vous du ${dahira.name}`)}`,
    'X-WR-TIMEZONE:Africa/Dakar',
    // Les applications revérifient le calendrier toutes les 6 heures
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ];
  for (const e of [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const url = siteUrl ? `${siteUrl.replace(/\/$/, '')}/agenda/${e.slug}/` : '';
    const end = e.endsAt ?? new Date(new Date(e.startsAt).getTime() + 3 * 3_600_000).toISOString();
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@${host}`,
      `DTSTAMP:${stamp(now.toISOString())}`,
      ...(e.timeTbc
        ? [`DTSTART;VALUE=DATE:${day(e.startsAt)}`, `DTEND;VALUE=DATE:${nextDay(e.startsAt)}`]
        : [`DTSTART:${stamp(e.startsAt)}`, `DTEND:${stamp(end)}`]),
      `SUMMARY:${esc(e.title)}`,
      `LOCATION:${esc(e.place)}`,
      ...(e.description || url ? [`DESCRIPTION:${esc([e.timeTbc ? 'Heure à confirmer.' : '', e.description ?? '', url].filter(Boolean).join('\n\n'))}`] : []),
      ...(url ? [`URL:${url}`] : []),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
