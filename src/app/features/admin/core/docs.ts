import { DbStatut, DocRow, statutFromDb, statutToDb, supabase } from './supabase';

/** Tables « document » : une colonne `data` qui suit le modèle du site */
export type DocTable = 'events' | 'albums';

/** Colonnes de tri/filtre propres à chaque table, recalculées depuis l'objet */
export type DocColumns = ({ starts_at: string } | { date: string }) & {
  status?: 'draft' | 'published' | 'scheduled';
  publish_at?: string | null;
};

/** Tables et colonnes de la base commune (module site) */
const TABLE: Record<DocTable, string> = { events: 'site_evenements', albums: 'site_albums' };
const COLUMN: Record<string, string> = { starts_at: 'debut', date: 'date', updated_at: 'updated_at' };
const SELECT = 'id, dahira_id, slug, data, updated_at, statut, publier_le';

type DbRow<T> = Omit<DocRow<T>, 'status' | 'publish_at'> & { statut: DbStatut; publier_le: string | null };

function fromDb<T>({ statut, publier_le, ...rest }: DbRow<T>): DocRow<T> {
  return { ...rest, status: statutFromDb(statut), publish_at: publier_le };
}

function toDb(columns: DocColumns): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('starts_at' in columns) row['debut'] = columns.starts_at;
  if ('date' in columns) row['date'] = columns.date;
  if (columns.status) row['statut'] = statutToDb(columns.status);
  if (columns.publish_at !== undefined) row['publier_le'] = columns.publish_at;
  return row;
}

export async function listDocs<T>(table: DocTable, dahiraId: string, order: string, ascending = true) {
  const { data, error } = await supabase()
    .from(TABLE[table])
    .select(SELECT)
    .eq('dahira_id', dahiraId)
    .order(COLUMN[order] ?? order, { ascending });
  if (error) throw error;
  return ((data ?? []) as DbRow<T>[]).map(fromDb);
}

export async function getDoc<T>(table: DocTable, id: string) {
  const { data, error } = await supabase().from(TABLE[table]).select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? fromDb(data as DbRow<T>) : null;
}

/** Création (sans id) ou mise à jour ; renvoie l'id */
export async function saveDoc<T extends { slug: string }>(
  table: DocTable,
  dahiraId: string,
  id: string | null,
  data: T,
  columns: DocColumns,
): Promise<string> {
  const row: Record<string, unknown> = { dahira_id: dahiraId, slug: data.slug, data, ...toDb(columns) };
  const query = id
    ? supabase().from(TABLE[table]).update(row).eq('id', id).select('id').single()
    : supabase().from(TABLE[table]).insert(row).select('id').single();
  const { data: saved, error } = await query;
  if (error) throw error;
  return (saved as { id: string }).id;
}

export async function deleteDoc(table: DocTable, id: string): Promise<void> {
  const { error } = await supabase().from(TABLE[table]).delete().eq('id', id);
  if (error) throw error;
}
