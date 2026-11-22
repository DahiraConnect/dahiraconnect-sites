import { DocRow, supabase } from './supabase';

/** Tables « document » : une colonne `data` qui suit le modèle du site */
export type DocTable = 'events' | 'albums';

/** Colonnes de tri/filtre propres à chaque table, recalculées depuis l'objet */
export type DocColumns = ({ starts_at: string } | { date: string }) & {
  status?: 'draft' | 'published' | 'scheduled';
  publish_at?: string | null;
};

export async function listDocs<T>(table: DocTable, dahiraId: string, order: string, ascending = true) {
  const { data, error } = await supabase()
    .from(table)
    .select('id, dahira_id, slug, data, updated_at, status, publish_at')
    .eq('dahira_id', dahiraId)
    .order(order, { ascending });
  if (error) throw error;
  return (data ?? []) as DocRow<T>[];
}

export async function getDoc<T>(table: DocTable, id: string) {
  const { data, error } = await supabase()
    .from(table)
    .select('id, dahira_id, slug, data, updated_at, status, publish_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as DocRow<T> | null;
}

/** Création (sans id) ou mise à jour ; renvoie l'id */
export async function saveDoc<T extends { slug: string }>(
  table: DocTable,
  dahiraId: string,
  id: string | null,
  data: T,
  columns: DocColumns,
): Promise<string> {
  const row: Record<string, unknown> = { dahira_id: dahiraId, slug: data.slug, data, ...columns };
  const query = id
    ? supabase().from(table).update(row).eq('id', id).select('id').single()
    : supabase().from(table).insert(row).select('id').single();
  const { data: saved, error } = await query;
  if (error) throw error;
  return (saved as { id: string }).id;
}

export async function deleteDoc(table: DocTable, id: string): Promise<void> {
  const { error } = await supabase().from(table).delete().eq('id', id);
  if (error) throw error;
}
