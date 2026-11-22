// Sauvegarde du stockage Supabase (bucket « site » : photos, sons, images de partage).
// Usage : SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/backup-storage.mjs <dossier>
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const out = process.argv[2] ?? 'sauvegarde/media';
const BUCKET = process.env.BUCKET || 'site';

if (!url || !key) {
  console.error('backup-storage : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont nécessaires.');
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };

/** Liste récursive des fichiers d'un dossier du bucket */
async function list(prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) throw new Error(`liste ${prefix} : HTTP ${res.status}`);
    const items = await res.json();
    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      // Un dossier n'a pas d'identifiant
      if (item.id) files.push(path);
      else files.push(...(await list(path)));
    }
    if (items.length < 1000) return files;
  }
}

const files = await list();
let bytes = 0;
for (const path of files) {
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`, { headers });
  if (!res.ok) throw new Error(`téléchargement ${path} : HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  bytes += data.length;
  const target = join(out, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data);
}
console.log(`backup-storage : ${files.length} fichiers, ${(bytes / 1e6).toFixed(1)} Mo`);
