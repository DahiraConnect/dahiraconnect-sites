/** Une personne, décrite une seule fois même si elle occupe plusieurs postes */
export interface Person {
  id: string;
  name: string;
  /** Photo (carrée conseillée) — uniquement avec l'accord de la personne */
  photoUrl?: string;
}

/** Un poste : une personne + son rôle ('Président', 'Responsable'…) */
export interface Position {
  personId: string;
  /** Absent = simple membre de la commission */
  role?: string;
  /** Mis en avant en tête de la commission (sinon : rôle « Responsable… ») */
  lead?: boolean;
}

export interface Commission {
  /** Ancre de la page : /le-dahira/bureau#organisation */
  id: string;
  name: string;
  description?: string;
  members: Position[];
}

/** Bureau : bureau exécutif + commissions */
export interface Board {
  people: Person[];
  executive: Position[];
  commissions: Commission[];
}

export interface HistoryStep {
  year: string;
  title: string;
  text: string;
  highlight?: boolean;
}

export interface LineageStep {
  /** 'Arrière-grand-père', 'Grand-père', 'Père', 'Notre guide' */
  relation: string;
  name: string;
  /** « Maodo », « Borom Daaraji »… */
  alias?: string;
  /** '1885 – 1957' */
  years?: string;
  text: string;
  highlight?: boolean;
  /** Portrait (carré conseillé) */
  photoUrl?: string;
  /** Repères datés : { year: '1922', label: 'Premier Khalife général' } */
  milestones?: { year: string; label: string }[];
}

export interface CharterRule {
  title: string;
  /** Expression en wolof : « Yar ak téguine » */
  wolof?: string;
  detail?: string;
  /** Montants à mettre en évidence */
  amounts?: { label: string; amount: string }[];
}

export interface ScheduleStep {
  /** '21 h 00' ou '21 h 00 – 22 h 40' */
  time: string;
  label: string;
}

/** Charte (règlement) du dahira */
export interface Charter {
  intro: string;
  rules: CharterRule[];
  schedule: ScheduleStep[];
  scheduleNote?: string;
}

/** Textes éditoriaux des pages (back-office en phase 2) */
export interface PageContent {
  home: {
    aboutTitle: string;
    aboutText: string;
  };
  about: {
    heroTitle: string;
    history: HistoryStep[];
  };
  guide: {
    intro: string;
    bio: string;
    lineageTitle: string;
    lineageIntro: string;
    lineage: LineageStep[];
    didYouKnow: string;
    sources: string;
    sourceLinks?: { label: string; url: string }[];
  };
  join: {
    intro: string;
    steps: string[];
  };
  charter?: Charter;
}
