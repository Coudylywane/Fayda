// Interface pour les Tafsirs
export interface Tafsir {
  id: number;
  title: string;
  author: string;
  ayahCount: number;
  number: number;
}

// Interface pour les Ouvrages
export interface Ouvrage {
  title: string;
  author: string;
  pageCount: number;
  number: number;
}

export interface Book {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  translator?: string;
  coverImage: string;
  reads: number;
  pages: number;
  language: string;
  description?: string;
}