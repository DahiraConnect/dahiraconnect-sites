/** Texte comparable : minuscules, sans accents ni ponctuation (« Ndèye » trouve « ndeye ») */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Tous les mots tapés doivent se retrouver dans le texte, dans n'importe quel ordre */
export function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(fields.filter(Boolean).join(' '));
  return words.every((w) => haystack.includes(w));
}

/** Ligne d'import « Prénom(s) Nom [téléphone] » → personne (le dernier mot est le nom de famille) */
export function parseNameLine(line: string): { first: string; last: string; phone?: string } | null {
  const phoneMatch = line.match(/(\+?\d[\d\s.-]{7,}\d)/);
  const phone = phoneMatch ? phoneMatch[1].replace(/[^\d+]/g, '') : undefined;
  const words = line
    .replace(phoneMatch?.[0] ?? '', ' ')
    .replace(/[;,\t]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 2) return null;
  return { first: words.slice(0, -1).join(' '), last: words[words.length - 1], ...(phone ? { phone } : {}) };
}

/** Cellule CSV (séparateur « ; » pour Excel en français) */
export function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? '');
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
