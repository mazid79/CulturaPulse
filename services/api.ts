import { Country, Holiday, NewsArticle, LanguagePhrase, CulturalTip } from '@/types';
import { mockCountries } from '@/utils/mockData'; // Your rich mock data for countries

// --- API Key Management (Placeholders - User must replace or use @env) ---
// In a real app, use environment variables (e.g., import { GNEWS_API_KEY } from '@env';)
const GNEWS_API_KEY = 'c8c43e2209612ffea922c76214aebc0f'; // Replace with your actual GNews API key

// --- Base API URLs ---
const NAGER_DATE_API_URL = 'https://date.nager.at/api/v3';
const GNEWS_API_URL = 'https://gnews.io/api/v4/search?q=example&apikey=c8c43e2209612ffea922c76214aebc0f';
const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries';

// --- API Client ---
interface FetchOptions extends RequestInit {}

const fetchWithErrorHandling = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage += ` - ${errorBody.message || errorBody.title || JSON.stringify(errorBody)}`;
      } catch (e) { /* Ignore if error body isn't JSON */ }
      console.error(`API Error (${url}):`, errorMessage);
      throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json() as T;
    }
    console.warn(`Expected JSON response from ${url} but received ${contentType}`);
    throw new Error(`Unexpected content type: ${contentType} from ${url}`);
  } catch (error) {
    console.error(`Network or other error fetching from ${url}:`, error);
    throw error;
  }
};

// === COUNTRIES ===
export const getCountries = async (): Promise<Country[]> => {
  return Promise.resolve(mockCountries);
};

export const getCountryById = async (id: string): Promise<Country | undefined> => {
  return Promise.resolve(mockCountries.find(country => country.id === id));
};

// === HOLIDAYS (Nager.Date API) ===
interface NagerDateHoliday {
  date: string; localName: string; name: string; countryCode: string;
  fixed: boolean; global: boolean; counties: string[] | null;
  launchYear: number | null; types: string[];
}
export const getHolidays = async (countryCode: string, year = new Date().getFullYear()): Promise<Holiday[]> => {
  const url = `${NAGER_DATE_API_URL}/PublicHolidays/${year}/${countryCode.toUpperCase()}`;
  try {
    const data = await fetchWithErrorHandling<NagerDateHoliday[]>(url);
    return data.map((h, index) => ({
      id: `${countryCode}-${year}-${h.date}-${index}`, name: h.name,
      description: h.localName !== h.name ? `Local name: ${h.localName}` : h.name,
      date: h.date, type: h.types.join(', ') || 'Public',
      isNationwide: h.global === true,
    }));
  } catch (error) {
    console.error(`Failed to fetch holidays for ${countryCode} from Nager.Date:`, error);
    return mockHolidayData[countryCode.toUpperCase()] || [];
  }
};

// === NEWS (GNews.io) ===
interface GNewsArticle {
  title: string; description: string; content: string; url: string; image: string | null;
  publishedAt: string; source: { name: string; url: string; };
}
interface GNewsApiResponse { totalArticles: number; articles: GNewsArticle[]; }

export const getNews = async (countryCode: string): Promise<NewsArticle[]> => {
  if (!GNEWS_API_KEY || GNEWS_API_KEY.includes('YOUR_GNEWS_API_KEY')) {
    console.warn('GNews API key missing/placeholder. Returning mock news.');
    return mockNewsData[countryCode.toUpperCase()] || [];
  }
  const country = mockCountries.find(c => c.code.toUpperCase() === countryCode.toUpperCase());
  const lang = country ? country.languages[0].split('-')[0].toLowerCase() : 'en';
  const query = `country ${country?.name || countryCode}`;
  const url = `${GNEWS_API_URL}/search?q=${encodeURIComponent(query)}&lang=${lang}&country=${countryCode.toLowerCase()}&max=10&apikey=${GNEWS_API_KEY}`;
  try {
    const data = await fetchWithErrorHandling<GNewsApiResponse>(url);
    return data.articles.map((article, index) => ({
      id: article.url || `${countryCode}-news-${index}`, title: article.title,
      description: article.description || 'Read more.', url: article.url,
      source: article.source.name || 'Unknown', publishedAt: article.publishedAt,
      imageUrl: article.image || `https://via.placeholder.com/400x200?text=${encodeURIComponent(country?.name || 'News')}`,
    }));
  } catch (error) {
    console.error(`Failed to fetch news for ${countryCode} from GNews:`, error);
    return mockNewsData[countryCode.toUpperCase()] || [];
  }
};

// === LANGUAGE PHRASES (Wikimedia Commons examples + TTS Fallback planned in Card) ===
const WIKIMEDIA_COMMONS_AUDIO_BASE = 'https://upload.wikimedia.org/wikipedia/commons/';
const ES_HOLA_AUDIO = WIKIMEDIA_COMMONS_AUDIO_BASE + 'c/c0/Es-hola.ogg';
const FR_BONJOUR_AUDIO = WIKIMEDIA_COMMONS_AUDIO_BASE + '3/3e/Fr-bonjour.ogg';
const DE_GUTENTAG_AUDIO = WIKIMEDIA_COMMONS_AUDIO_BASE + 'e/e3/De-Guten_Tag.ogg';
const JA_KONNICHIWA_AUDIO = WIKIMEDIA_COMMONS_AUDIO_BASE + '9/90/Ja-%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF.ogg';

const mockLanguageData: Record<string, LanguagePhrase[]> = {
  en: [
    { id: 'en-p1', text: 'Hello', translation: 'Hello', pronunciation: 'hel-lo', category: 'greeting', languageCode: 'en-US', audioUrl: undefined },
    { id: 'en-p2', text: 'Thank you', translation: 'Thank you', pronunciation: 'thank yoo', category: 'courtesy', languageCode: 'en-US', audioUrl: undefined },
    { id: 'en-p3', text: 'Where is the bathroom?', translation: 'Where is the bathroom?', pronunciation: 'wear iz thuh bath-room', category: 'essentials', languageCode: 'en-US', audioUrl: undefined },
  ],
  es: [
    { id: 'es-p1', text: 'Hello', translation: 'Hola', pronunciation: 'OH-lah', category: 'greeting', languageCode: 'es-ES', audioUrl: ES_HOLA_AUDIO },
    { id: 'es-p2', text: 'Thank you', translation: 'Gracias', pronunciation: 'GRAH-see-ahs', category: 'courtesy', languageCode: 'es-ES', audioUrl: undefined },
    { id: 'es-p3', text: 'Goodbye', translation: 'Adiós', pronunciation: 'ah-dee-OHS', category: 'farewell', languageCode: 'es-ES', audioUrl: undefined },
  ],
  fr: [
    { id: 'fr-p1', text: 'Hello', translation: 'Bonjour', pronunciation: 'bon-ZHOOR', category: 'greeting', languageCode: 'fr-FR', audioUrl: FR_BONJOUR_AUDIO },
    { id: 'fr-p2', text: 'Thank you', translation: 'Merci', pronunciation: 'mer-SEE', category: 'courtesy', languageCode: 'fr-FR', audioUrl: undefined },
  ],
  de: [
    { id: 'de-p1', text: 'Hello / Good day', translation: 'Guten Tag', pronunciation: 'GOO-ten tahg', category: 'greeting', languageCode: 'de-DE', audioUrl: DE_GUTENTAG_AUDIO },
    { id: 'de-p2', text: 'Thank you', translation: 'Danke', pronunciation: 'DUNK-uh', category: 'courtesy', languageCode: 'de-DE', audioUrl: undefined },
  ],
  ja: [
    { id: 'ja-p1', text: 'Hello', translation: 'こんにちは (Konnichiwa)', pronunciation: 'kon-nee-chee-WAH', category: 'greeting', languageCode: 'ja-JP', audioUrl: JA_KONNICHIWA_AUDIO },
    { id: 'ja-p2', text: 'Thank you', translation: 'ありがとう (Arigato)', pronunciation: 'ah-ree-GAH-toh', category: 'courtesy', languageCode: 'ja-JP', audioUrl: undefined },
  ],
  it: [ { id: 'it-p1', text: 'Hello', translation: 'Ciao', pronunciation: 'chow', category: 'greeting', languageCode: 'it-IT', audioUrl: undefined } ],
  ko: [ { id: 'ko-p1', text: 'Hello', translation: '안녕하세요 (Annyeonghaseyo)', pronunciation: 'an-nyong-ha-se-yo', category: 'greeting', languageCode: 'ko-KR', audioUrl: undefined } ],
};

export const getLanguagePhrases = async (languageCode: string): Promise<LanguagePhrase[]> => {
  const lang = languageCode.toLowerCase().split('-')[0];
  if (mockLanguageData[lang]) {
    console.log(`Language Phrases: Using MOCK DATA for language "${lang}".`);
    return Promise.resolve(mockLanguageData[lang]);
  }
  console.warn(`Language Phrases: No mock data for language "${lang}". Returning empty array.`);
  return Promise.resolve([]);
};

// === CULTURAL TIPS (Curated Mock Data) ===
export const getCulturalTips = async (countryCode: string): Promise<CulturalTip[]> => {
  console.warn(`Cultural Tips: Using MOCK DATA for country "${countryCode}".`);
  return mockCulturalTipsData[countryCode.toUpperCase()] || [];
};

// --- Minimal Mock Data for Fallbacks (expand as needed) ---
const mockHolidayData: Record<string, Holiday[]> = {
  US: [{ id: 'us-h-mock', name: 'US Mock Holiday', date: `${new Date().getFullYear()}-07-04`, description: 'Mock desc', type: 'National', isNationwide: true }],
  FR: [{ id: 'fr-h-mock', name: 'FR Mock Holiday', date: `${new Date().getFullYear()}-07-14`, description: 'Mock desc', type: 'National', isNationwide: true }],
};
const mockNewsData: Record<string, NewsArticle[]> = {
  US: [{ id: 'us-n-mock', title: 'US Mock News', url: '#', source: 'Mock', publishedAt: '2023-01-01T00:00:00Z', description: 'Mock', imageUrl: 'https://via.placeholder.com/100' }],
  FR: [{ id: 'fr-n-mock', title: 'FR Mock News', url: '#', source: 'Mock', publishedAt: '2023-01-01T00:00:00Z', description: 'Mock', imageUrl: 'https://via.placeholder.com/100' }],
};
const mockCulturalTipsData: Record<string, CulturalTip[]> = {
  US: [{ id: 'us-ct-mock', title: 'US Mock Tip', content: 'Mock content', category: 'social' }],
  FR: [{ id: 'fr-ct-mock', title: 'FR Mock Tip', content: 'Mock content', category: 'social' }],
};