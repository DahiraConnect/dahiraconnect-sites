// Transfert d'un site de l'ancien Supabase DahiraConnect vers la base commune DahiraConnect.
//
// Copie : contenu du site, événements, albums, inscriptions, équipe, journal, statistiques,
// crochet de déploiement et fichiers (bucket « media » → bucket « site »). Les adresses des
// photos sont réécrites vers le nouveau stockage. Le script peut être relancé sans doublon.
//
// Avant : créer le dahira dans la base commune (création d'un dahira depuis le site ou le bureau),
// puis récupérer son identifiant (table dahiras).
//
// Usage :
//   ANCIEN_URL=https://<ancien>.supabase.co ANCIENNE_CLE=<service_role ancien> \
//   NOUVEAU_URL=https://<nouveau>.supabase.co NOUVELLE_CLE=<service_role nouveau> \
//   DAHIRA_ID=<uuid du dahira dans la base commune> ADRESSE=moutahabina \
//   node scripts/migrer-site.mjs [--essai]
//
// --essai : lit et compte tout, n'écrit rien.
// Les clés service_role ne doivent jamais être commitées ni collées ailleurs que dans le terminal.
import { createClient } from '@supabase/supabase-js';

const env = (k, def) => {
  const v = process.env[k] ?? def;
  if (!v) {
    console.error(`migrer-site : variable ${k} manquante.`);
    process.exit(1);
  }
  return v.replace(/\/$/, '');
};
const ANCIEN_URL = env('ANCIEN_URL');
const NOUVEAU_URL = env('NOUVEAU_URL');
const DAHIRA_ID = env('DAHIRA_ID');
const ADRESSE = env('ADRESSE', 'moutahabina');
const ESSAI = process.argv.includes('--essai');

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const ancien = createClient(ANCIEN_URL, env('ANCIENNE_CLE'), options);
const nouveau = createClient(NOUVEAU_URL, env('NOUVELLE_CLE'), options);

const OLD_MEDIA = `${ANCIEN_URL}/storage/v1/object/public/media/`;
const NEW_MEDIA = `${NOUVEAU_URL}/storage/v1/object/public/site/`;
/** Réécrit toutes les adresses de fichiers dans un objet JSON */
const reecrire = (v) => (v == null ? v : JSON.parse(JSON.stringify(v).replaceAll(OLD_MEDIA, NEW_MEDIA)));

const STATUT = { draft: 'brouillon', published: 'publie', scheduled: 'programme' };
const GENRE = { view: 'vue', click: 'clic', device: 'appareil' };
const ROLE = { owner: 'proprietaire', editor: 'redacteur' };

const rapport = [];
const note = (ligne) => {
  rapport.push(ligne);
  console.log(`  ${ligne}`);
};

async function lire(client, table, filtre) {
  const lignes = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await filtre(client.from(table).select('*')).range(from, from + 999);
    if (error) throw new Error(`${table} : ${error.message}`);
    lignes.push(...data);
    if (data.length < 1000) return lignes;
  }
}

async function ecrire(table, lignes, onConflict) {
  if (ESSAI || !lignes.length) return;
  for (let i = 0; i < lignes.length; i += 500) {
    const { error } = await nouveau.from(table).upsert(lignes.slice(i, i + 500), { onConflict });
    if (error) throw new Error(`${table} : ${error.message}`);
  }
}

/** Liste récursive des fichiers d'un dossier */
async function fichiers(client, bucket, prefix) {
  const liste = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`stockage ${prefix} : ${error.message}`);
    for (const item of data) {
      const chemin = `${prefix}/${item.name}`;
      if (item.id) liste.push({ chemin, type: item.metadata?.mimetype });
      else liste.push(...(await fichiers(client, bucket, chemin)));
    }
    if (data.length < 1000) return liste;
  }
}

console.log(`migrer-site : « ${ADRESSE} » → dahira ${DAHIRA_ID}${ESSAI ? ' (essai, rien n’est écrit)' : ''}`);

// 1. Vérifications
const { data: source, error: e1 } = await ancien.from('dahiras').select('*').eq('slug', ADRESSE).maybeSingle();
if (e1 || !source) throw new Error(`site « ${ADRESSE} » introuvable dans l'ancienne base`);
const { data: cible } = await nouveau.from('dahiras').select('id, nom').eq('id', DAHIRA_ID).maybeSingle();
if (!cible) throw new Error(`dahira ${DAHIRA_ID} introuvable dans la base commune`);
const { data: occupe } = await nouveau.from('sites').select('dahira_id').eq('adresse', ADRESSE).maybeSingle();
if (occupe && occupe.dahira_id !== DAHIRA_ID) throw new Error(`l'adresse « ${ADRESSE} » appartient déjà à un autre dahira`);
note(`dahira cible : ${cible.nom}`);
// Premier transfert ? (le journal est repris une seule fois)
const { count: dejaLa } = await nouveau
  .from('site_journal')
  .select('id', { count: 'exact', head: true })
  .eq('dahira_id', DAHIRA_ID);
const debut = new Date().toISOString();

// 2. Fichiers (avant le contenu : les adresses réécrites doivent exister)
const liste = await fichiers(ancien, 'media', ADRESSE);
let copies = 0;
if (!ESSAI) {
  for (const f of liste) {
    const { data: blob, error } = await ancien.storage.from('media').download(f.chemin);
    if (error) throw new Error(`téléchargement ${f.chemin} : ${error.message}`);
    const { error: err } = await nouveau.storage
      .from('site')
      .upload(f.chemin, blob, { contentType: f.type ?? blob.type, cacheControl: '31536000', upsert: true });
    if (err) throw new Error(`envoi ${f.chemin} : ${err.message}`);
    copies++;
  }
}
note(`fichiers : ${liste.length}${ESSAI ? '' : ` copiés (${copies})`}`);

// 3. Le site
await ecrire(
  'sites',
  [
    {
      dahira_id: DAHIRA_ID,
      adresse: ADRESSE,
      profil: reecrire(source.profile),
      contenu: reecrire(source.content),
      bureau: reecrire(source.board),
      quiz: reecrire(source.quiz),
    },
  ],
  'dahira_id',
);
note('site : profil, textes, bureau et quiz');

// 4. Événements et albums (mêmes identifiants : les inscriptions restent reliées)
const doc = (r, colonne) => ({
  id: r.id,
  dahira_id: DAHIRA_ID,
  slug: r.slug,
  ...colonne,
  data: reecrire(r.data),
  statut: STATUT[r.status] ?? 'publie',
  publier_le: r.publish_at ?? null,
});
const evenements = await lire(ancien, 'events', (q) => q.eq('dahira_id', source.id));
await ecrire('site_evenements', evenements.map((r) => doc(r, { debut: r.starts_at })), 'id');
note(`événements : ${evenements.length}`);
const albums = await lire(ancien, 'albums', (q) => q.eq('dahira_id', source.id));
await ecrire('site_albums', albums.map((r) => doc(r, { date: r.date })), 'id');
note(`albums : ${albums.length}`);

// 5. Inscriptions
const inscriptions = await lire(ancien, 'event_registrations', (q) => q.eq('dahira_id', source.id));
await ecrire(
  'site_inscriptions',
  inscriptions.map((r) => ({
    id: r.id,
    dahira_id: DAHIRA_ID,
    evenement_id: r.event_id,
    prenom: r.first_name,
    nom: r.last_name,
    telephone: r.phone,
    personnes: r.people,
    cle_nom: r.name_key,
    source: r.source,
    created_at: r.created_at,
  })),
  'id',
);
note(`inscriptions : ${inscriptions.length}`);

// 6. Équipe : comptes retrouvés (ou créés) par e-mail dans la base commune
const comptes = new Map();
for (let page = 1; ; page++) {
  const { data, error } = await ancien.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error(`comptes : ${error.message}`);
  for (const u of data.users) comptes.set(u.id, u.email);
  if (data.users.length < 1000) break;
}
const admins = await lire(ancien, 'dahira_admins', (q) => q.eq('dahira_id', source.id));
const equipe = [];
const parEmail = new Map();
for (const a of admins) {
  const email = comptes.get(a.user_id);
  if (!email) continue;
  let { data: id } = await nouveau.rpc('site_trouver_compte', { p_email: email });
  if (!id && !ESSAI) {
    const { data, error } = await nouveau.auth.admin.createUser({ email, email_confirm: true });
    if (error) throw new Error(`compte ${email} : ${error.message}`);
    id = data.user.id;
  }
  if (id) {
    parEmail.set(email.toLowerCase(), id);
    equipe.push({ dahira_id: DAHIRA_ID, profile_id: id, role: ROLE[a.role] ?? 'redacteur', personne_bureau: a.person_id });
  }
  note(`équipe : ${email} (${ROLE[a.role] ?? 'redacteur'})${id ? '' : ' — compte à créer'}`);
}
await ecrire('site_equipe', equipe, 'dahira_id,profile_id');

// 7. Journal : seulement au premier transfert (pas de doublon en relançant).
// Les lignes « Système » écrites par l'import lui-même sont remplacées par l'historique d'origine.
const journal = await lire(ancien, 'audit_log', (q) => q.eq('dahira_id', source.id).order('id'));
if (!ESSAI) {
  // À chaque passage : retirer les lignes écrites par les déclencheurs pendant ce transfert
  const { error } = await nouveau
    .from('site_journal')
    .delete()
    .eq('dahira_id', DAHIRA_ID)
    .eq('auteur', 'Système')
    .is('profile_id', null)
    .gte('created_at', debut);
  if (error) throw new Error(`site_journal : ${error.message}`);
}
if (!dejaLa) {
  await ecrire(
    'site_journal',
    journal.map((r) => ({
      dahira_id: DAHIRA_ID,
      profile_id: r.user_email ? (parEmail.get(r.user_email.toLowerCase()) ?? null) : null,
      auteur: r.user_name || r.user_email || 'Système',
      action: r.action,
      entite: r.entity,
      entite_id: r.entity_id,
      libelle: r.label,
      created_at: r.created_at,
    })),
  );
}
note(`journal : ${journal.length}${dejaLa ? ' (déjà repris, ignoré)' : ''}`);

// 8. Statistiques
const stats = await lire(ancien, 'stats_daily', (q) => q.eq('dahira_id', source.id));
await ecrire(
  'site_stats',
  stats
    .filter((r) => GENRE[r.kind])
    .map((r) => ({
      dahira_id: DAHIRA_ID,
      jour: r.day,
      genre: GENRE[r.kind],
      cle: r.kind === 'device' ? r.key.replace(/^view:/, 'vue:').replace(/^click:/, 'clic:') : r.key,
      nombre: r.count,
    })),
  'dahira_id,jour,genre,cle',
);
note(`statistiques : ${stats.length} lignes`);

// 9. Crochet de déploiement
const { data: prive } = await ancien.from('dahira_private').select('deploy_hook').eq('dahira_id', source.id).maybeSingle();
if (prive?.deploy_hook) await ecrire('site_prive', [{ dahira_id: DAHIRA_ID, crochet_deploiement: prive.deploy_hook }], 'dahira_id');
note(`crochet de déploiement : ${prive?.deploy_hook ? 'repris' : 'aucun'}`);

console.log(ESSAI ? 'Essai terminé : rien n’a été écrit.' : 'Transfert terminé.');
