export interface BibleVersion {
  id: string; // e.g. "RVR1960", "NVI", "DHH", "LBLA", "NTV", "TLA"
  name: string; // e.g. "Reina Valera 1960"
  abbreviation: string;
  language: string; // "spa"
  isPublicDomain?: boolean;
}

export interface BibleBook {
  id: string; // e.g. "GEN", "JHN", "PSA"
  name: string; // e.g. "Juan", "Salmos", "Génesis"
  testament: 'OT' | 'NT';
  chaptersCount: number;
  abbreviations: string[]; // e.g. ["jn", "juan", "jhn"]
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BiblePassageResponse {
  reference: string;
  book: string;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  text: string;
  translation: string;
  verses: BibleVerse[];
}

export interface BibleSearchResultItem {
  reference: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  preview: string;
}

export interface YouVersionApiPassage {
  id: string;
  content: string;
  reference: string;
  version_id: number | string;
}
