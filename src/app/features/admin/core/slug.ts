/** « Ziar Tivaouane 2026 » → 'ziar-tivaouane-2026' (adresse de la page) */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** Adresse libre : ajoute -2, -3… si elle existe déjà */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = base || 'page';
  if (!used.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/** Sénégal : UTC toute l'année. Date + heure saisies → ISO. */
export function toIso(date: string, time: string | null): string {
  return `${date}T${time || '12:00'}:00Z`;
}

/** ISO → { date: '2026-12-12', time: '20:30' } pour les champs du formulaire */
export function fromIso(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  };
}
