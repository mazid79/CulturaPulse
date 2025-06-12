import { useState, useEffect } from 'react';
import {
  getCountryById,
  getHolidays,
  getNews,
  getLanguagePhrases,
  getCulturalTips,
} from '@/services/api'; // Assuming your API service functions
import { Country, Holiday, NewsArticle, LanguagePhrase, CulturalTip, CountryDetails } from '@/types';

export function useCountryData(countryId: string | undefined) {
  const [data, setData] = useState<CountryDetails>({
    country: null, // Corrected: lowercase 'c'
    holidays: [],
    news: [],
    phrases: [],
    culturalTips: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCountryData = async () => {
      if (!countryId) {
        if (isMounted) {
          setData({
            country: null, // Corrected: lowercase 'c'
            holidays: [],
            news: [],
            phrases: [],
            culturalTips: [],
            loading: false,
            error: 'Country ID is required.',
          });
        }
        return;
      }

      try {
        // Reset loading and error, keep potentially stale data for smoother UI
        setData(prev => ({
            ...prev,
            loading: true,
            error: null
            // country remains prev.country here until new data is fetched or fails
        }));

        const countryDetailsFromAPI = await getCountryById(countryId); // Renamed to avoid confusion with 'country' in state
        
        if (!countryDetailsFromAPI) {
          if (isMounted) {
            setData(prev => ({
              ...prev,
              country: null, // Corrected: lowercase 'c'
              loading: false,
              error: `Country with ID "${countryId}" not found.`,
            }));
          }
          return;
        }

        // Fetch all related data in parallel
        const [holidays, news, phrases, culturalTips] = await Promise.all([
          getHolidays(countryDetailsFromAPI.code).catch(err => { console.warn(`Failed to fetch holidays for ${countryDetailsFromAPI.code}:`, err); return []; }),
          getNews(countryDetailsFromAPI.code).catch(err => { console.warn(`Failed to fetch news for ${countryDetailsFromAPI.code}:`, err); return []; }),
          // Ensure countryDetailsFromAPI.languages[0] exists before using it
          getLanguagePhrases(countryDetailsFromAPI.languages?.[0] || '').catch(err => { console.warn(`Failed to fetch phrases for ${countryDetailsFromAPI.languages?.[0]}:`, err); return []; }),
          getCulturalTips(countryDetailsFromAPI.code).catch(err => { console.warn(`Failed to fetch cultural tips for ${countryDetailsFromAPI.code}:`, err); return []; }),
        ]);

        if (isMounted) {
          setData({
            country: countryDetailsFromAPI, // Correct: using lowercase 'c' and the fetched country object
            holidays,
            news,
            phrases,
            culturalTips,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error(`Error fetching data for country ID "${countryId}":`, error);
        if (isMounted) {
          setData(prev => ({
            ...prev, // country will be prev.country here
            loading: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching country data.',
          }));
        }
      }
    };

    fetchCountryData();

    return () => {
      isMounted = false;
    };
  }, [countryId]);

  return data;
}