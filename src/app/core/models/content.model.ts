export interface BoardMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  order: number;
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
  };
  join: {
    intro: string;
    steps: string[];
  };
}
