import { ImageSourcePropType } from 'react-native'; // This is fine if you use it elsewhere, not directly in these types.

// API response types
export interface Holiday {
  id: string;
  name: string;
  description: string;
  date: string; // Format: YYYY-MM-DD
  type: string;
  isNationwide: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string; // ISO8601 string
  imageUrl?: string;
}

export interface LanguagePhrase {
  id: string;
  text: string;
  translation: string;
  pronunciation?: string; // Made pronunciation optional as not all sources might have it
  audioUrl?: string;
  category: string;
  languageCode?: string; // Added: BCP 47 language code (e.g., "en-US", "es-ES") for TTS
}

export interface CulturalTip {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string; // Could be LatLng object for more precision { latitude: number, longitude: number }
  historicalSignificance: string;
}

// Country data
export interface Country {
  id: string; // e.g., "us", "fr" (unique identifier)
  name: string; // e.g., "United States"
  code: string; // ISO 3166-1 alpha-2 code, e.g., "US", "FR"
  flagUrl: string;
  headerImageUrl: string;
  languages: string[]; // Array of primary language names or codes (e.g., ["English", "Spanish"] or ["en", "es"])
  capital: string;
  region: string; // e.g., "North America", "Europe"
  currency: string; // e.g., "USD (United States Dollar)"
  timeZone: string; // e.g., "UTC-5 (Eastern Time)" or main timezone
  isBookmarked?: boolean;
  landmarks?: Landmark[]; // Made optional as not all country objects might have this pre-filled
  culturalFacts?: string[]; // Made optional
  etiquetteRules?: string[]; // Made optional
  commonPhrases?: LanguagePhrase[]; // Made optional, might be fetched separately
  population?: string; // e.g., "330 million"
  officialLanguage?: string; // Could be a primary one if multiple
  climate?: string; // Brief description
  bestTimeToVisit?: string;
}

// User types
export interface User {
  id: string; // Firebase UID
  email: string | null; // Email can be null from some auth providers
  displayName?: string | null;
  photoUrl?: string | null;
  bookmarkedCountries?: string[]; // Array of Country IDs
  preferences?: UserPreferences;
  recentlyViewedCountries?: string[]; // Array of Country IDs
}

export interface UserPreferences {
  pushNotificationsEnabled?: boolean; // More descriptive name
  darkModeEnabled?: boolean; // More descriptive name
  languagePreference?: string; // BCP 47 language code
  newsCategories?: string[];
  autoPlayAudio?: boolean;
  // Add other user-specific settings here
}

// App state types (e.g., for useCountryData hook)
export interface CountryDetails {
  country: Country | null; // Updated: Can be null while loading or if not found
  holidays: Holiday[];
  news: NewsArticle[];
  phrases: LanguagePhrase[];
  culturalTips: CulturalTip[];
  loading: boolean;
  error: string | null;
}

// Animation types (remains as user provided)
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string; // e.g., 'linear', 'ease-in-out'
  from?: object;   // e.g., { opacity: 0, translateY: 20 }
  to?: object;     // e.g., { opacity: 1, translateY: 0 }
}

// Cache types (remains as user provided)
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  version?: string;
}

// TTS types
export interface TTSConfig {
  language?: string;         // BCP 47 language code
  pitch?: number;            // Usually between 0.5 and 2.0
  rate?: number;             // Usually between 0.5 and 2.0
  voiceIdentifier?: string;  // Updated: Platform-specific voice ID or name
  volume?: number;           // Usually between 0.0 and 1.0
}

// Added: For listing available TTS voices (used in tts.ts)
export interface Voice {
  id: string;       // Platform-specific unique identifier for the voice
  name: string;     // Display name of the voice
  language: string; // BCP 47 language code the voice supports
  quality?: string | number; // e.g., "Normal", "Enhanced", or a numeric value
  networkConnectionRequired?: boolean; // If the voice requires network
  // latency?: number; // If this info is available from the TTS engine
}