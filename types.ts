
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  translation?: string;
  audio?: string;
  numberInSurah?: number;
  surah?: Surah;
}

export interface Hadith {
  id: string;
  collection?: string;
  bookNumber?: string;
  hadithNumber?: string;
  hadithArabic?: string;
  hadithEnglish?: string;
  narrator: string;
  text: string;
  source: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingUrls?: { title: string; uri: string }[];
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  category: string;
  type: 'book' | 'audio' | 'video';
  image: string;
  pages?: number;
  language: string;
  rating: number;
  description: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export enum AppTab {
  QURAN = 'quran',
  HADITH = 'hadith',
  ART_STUDIO = 'art_studio',
  QURAN_AI = 'quran_ai',
  LIBRARY = 'library',
  TOOLS = 'tools',
  DEVELOPER = 'developer',
  ABOUT = 'about'
}
