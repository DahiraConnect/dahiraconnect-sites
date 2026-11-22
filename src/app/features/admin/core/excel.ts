import { normalize } from './search';

/** Colonnes du modèle d'import (dans cet ordre) */
export const TEMPLATE_COLUMNS = ['Prénom', 'Nom', 'Téléphone', 'Personnes'] as const;

export interface ImportedPerson {
  first: string;
  last: string;
  phone?: string;
  people: number;
}

export interface ImportResult {
  people: ImportedPerson[];
  /** « Ligne 7 : le nom manque » */
  errors: string[];
}

const HEADER_ALIASES: Record<keyof ImportedPerson, string[]> = {
  first: ['prenom', 'prenoms'],
  last: ['nom', 'nom de famille'],
  phone: ['telephone', 'tel', 'numero', 'portable'],
  people: ['personnes', 'nombre', 'nombre de personnes', 'pers'],
};

/**
 * Lignes d'une feuille (1re ligne = en-têtes du modèle) → personnes valides + erreurs lisibles.
 * Les colonnes sont reconnues par leur nom, dans n'importe quel ordre.
 */
export function parseSheetRows(rows: unknown[][]): ImportResult {
  const cell = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());
  const header = (rows[0] ?? []).map((h) => normalize(cell(h)));
  const col = (key: keyof ImportedPerson) => header.findIndex((h) => HEADER_ALIASES[key].includes(h));
  const idx = { first: col('first'), last: col('last'), phone: col('phone'), people: col('people') };
  if (idx.first < 0 || idx.last < 0) {
    return {
      people: [],
      errors: ['Le fichier ne suit pas le modèle : la première ligne doit contenir « Prénom » et « Nom ». Téléchargez le modèle et recopiez vos noms dedans.'],
    };
  }
  const people: ImportedPerson[] = [];
  const errors: string[] = [];
  rows.slice(1).forEach((row, i) => {
    const line = i + 2;
    const first = cell(row[idx.first]);
    const last = cell(row[idx.last]);
    const phoneRaw = idx.phone >= 0 ? cell(row[idx.phone]) : '';
    const peopleRaw = idx.people >= 0 ? cell(row[idx.people]) : '';
    if (!first && !last && !phoneRaw) return; // ligne vide
    if (!first || !last) {
      errors.push(`Ligne ${line} : ${!first ? 'le prénom' : 'le nom'} manque.`);
      return;
    }
    const digits = phoneRaw.replace(/\D/g, '');
    if (phoneRaw && (digits.length < 9 || digits.length > 15)) {
      errors.push(`Ligne ${line} (${first} ${last}) : numéro de téléphone incomplet.`);
      return;
    }
    const count = peopleRaw ? Number(peopleRaw) : 1;
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      errors.push(`Ligne ${line} (${first} ${last}) : « Personnes » doit être un nombre de 1 à 20.`);
      return;
    }
    people.push({ first, last, ...(phoneRaw ? { phone: phoneRaw } : {}), people: count });
  });
  return { people, errors };
}

const HEADER = { fontWeight: 'bold' as const, backgroundColor: '#0A3A1B', color: '#FFFFFF', height: 24 };

/** Modèle Excel à remplir : feuille « Participants » + feuille « Mode d'emploi » */
export async function downloadTemplate(eventTitle: string): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file');
  const participants = [TEMPLATE_COLUMNS.map((value) => ({ value, type: String, ...HEADER }))];
  const help = [
    [{ value: `Inscrire des participants : ${eventTitle}`, type: String, fontWeight: 'bold' as const, fontSize: 14 }],
    [{ value: '1. Remplissez la feuille « Participants » : une personne par ligne.', type: String }],
    [{ value: '2. « Prénom » et « Nom » sont obligatoires. « Téléphone » et « Personnes » sont facultatifs.', type: String }],
    [{ value: '3. « Personnes » : combien viennent en tout avec cette personne (1 si vous laissez vide).', type: String }],
    [{ value: '4. Ne changez pas les titres de la première ligne.', type: String }],
    [{ value: '5. Enregistrez, puis dans l’admin : Participants > Importer > Choisir le fichier.', type: String }],
    [{ value: 'Les noms déjà inscrits sont ignorés : vous pouvez réimporter sans créer de doublon.', type: String, fontStyle: 'italic' as const }],
  ];
  await writeXlsxFile([participants, help] as never, {
    sheets: ['Participants', 'Mode d’emploi'],
    columns: [
      [{ width: 22 }, { width: 22 }, { width: 18 }, { width: 12 }],
      [{ width: 90 }],
    ],
    stickyRowsCount: 1,
    fileName: 'modele-participants.xlsx',
  } as never);
}

/** Lecture d'un fichier .xlsx rempli */
export async function readParticipantsFile(file: File): Promise<ImportResult> {
  const { default: readXlsxFile } = await import('read-excel-file');
  const rows = await readXlsxFile(file);
  return parseSheetRows(rows as unknown[][]);
}

export interface ExportRow {
  first_name: string;
  last_name: string;
  phone: string | null;
  people: number;
  created_at: string;
  source: string;
}

/** Export Excel de la liste des participants */
export async function exportParticipantsXlsx(rows: ExportRow[], fileName: string): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file');
  const data = [
    ['N°', 'Prénom', 'Nom', 'Téléphone', 'Personnes', 'Inscrit le', 'Origine'].map((value) => ({ value, type: String, ...HEADER })),
    ...rows.map((r, i) => [
      { value: i + 1, type: Number },
      { value: r.first_name, type: String },
      { value: r.last_name, type: String },
      { value: r.phone ?? '', type: String },
      { value: r.people, type: Number },
      { value: new Date(r.created_at).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' }), type: String },
      { value: r.source, type: String },
    ]),
  ];
  await writeXlsxFile(data as never, {
    columns: [{ width: 6 }, { width: 20 }, { width: 20 }, { width: 16 }, { width: 11 }, { width: 20 }, { width: 10 }],
    stickyRowsCount: 1,
    fileName,
  } as never);
}
