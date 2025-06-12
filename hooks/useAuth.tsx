import { useState, useEffect, createContext, useContext, ReactNode } from 'react'; // Added ReactNode
import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'; // Import Supabase types
import { supabase } from '@/services/supabase';
import { User, UserPreferences } from '@/types'; // Ensure UserPreferences is imported

interface AuthState {
  user: User | null;
  session: SupabaseSession | null; // Use SupabaseSession type
  loading: boolean;
  error?: string | null; // Add error to state for UI feedback
}

interface AuthContextType extends Omit<AuthState, 'error'> { // Omit error from context value if handled differently
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>; // Updates shouldn't change id/email directly
  clearError: () => void; // Method to clear auth errors
  authError?: string | null; // Expose authError separately
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  clearError: () => {},
  authError: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUserProfile(session.user, session);
      } else {
        setState(prev => ({ ...prev, user: null, session: null, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user, session);
        } else {
          setState({ user: null, session: null, loading: false, error: null });
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser, session: SupabaseSession) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles') // Your Supabase table for user profiles
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows - profile might not exist yet
        throw profileError;
      }

      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || null,
        displayName: profileData?.display_name || supabaseUser.email?.split('@')[0] || 'CulturaPulse User',
        photoUrl: profileData?.photo_url || null,
        bookmarkedCountries: profileData?.bookmarked_countries || [],
        preferences: {
          // Corrected property names
          pushNotificationsEnabled: profileData?.push_notifications_enabled ?? false,
          darkModeEnabled: profileData?.dark_mode_enabled ?? false, // Default to false if not set
          languagePreference: profileData?.language_preference || 'en',
          // Ensure other preferences from UserPreferences type are mapped here
          newsCategories: profileData?.news_categories || [],
          autoPlayAudio: profileData?.auto_play_audio ?? false,
        },
        recentlyViewedCountries: profileData?.recently_viewed_countries || [],
      };

      setState({ user, session, loading: false, error: null });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setState(prev => ({
        ...prev,
        user: null, // Clear user on fetch error
        session: null, // Clear session as well
        loading: false,
        error: error?.message || 'Failed to fetch user profile.',
      }));
    }
  };

  const handleAuthAction = async (action: Promise<any>, successMessage?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await action;
      if (error) throw error;
      // For signUp, user profile creation might be handled by a trigger or need explicit call here.
      // For signIn, onAuthStateChange will trigger fetchUserProfile.
      // No direct setState for user/session here as onAuthStateChange handles it.
      // setState(prev => ({ ...prev, loading: false })); // loading becomes false via onAuthStateChange's fetch
    } catch (error: any) {
      console.error('Auth action error:', error);
      setState(prev => ({ ...prev, loading: false, error: error?.message || 'Authentication action failed.' }));
      throw error; // Re-throw for UI to handle if needed
    }
  };

  const signIn = async (email: string, password: string) => {
    await handleAuthAction(supabase.auth.signInWithPassword({ email, password }));
  };

  const signUp = async (email: string, password: string) => {
    // Options can be used to pass additional metadata during sign up
    // which can be used by a trigger to create a profile row.
    await handleAuthAction(supabase.auth.signUp({ email, password /*, options: { data: { display_name: 'New User' } } */ }));
  };

  const signOut = async () => {
    await handleAuthAction(supabase.auth.signOut());
    // onAuthStateChange will set user and session to null
  };

  const updateUser = async (updates: Partial<Omit<User, 'id' | 'email'>>) => {
    if (!state.user) throw new Error('No user logged in to update.');
    setState(prev => ({...prev, loading: true}));

    try {
      // Prepare updates for the 'profiles' table
      // Match column names in your Supabase 'profiles' table
      const profileUpdates: Record<string, any> = {};
      if (updates.displayName !== undefined) profileUpdates.display_name = updates.displayName;
      if (updates.photoUrl !== undefined) profileUpdates.photo_url = updates.photoUrl;
      if (updates.bookmarkedCountries !== undefined) profileUpdates.bookmarked_countries = updates.bookmarkedCountries;
      if (updates.recentlyViewedCountries !== undefined) profileUpdates.recently_viewed_countries = updates.recentlyViewedCountries;
      
      if (updates.preferences) {
        // Corrected property names
        if (updates.preferences.pushNotificationsEnabled !== undefined) profileUpdates.push_notifications_enabled = updates.preferences.pushNotificationsEnabled;
        if (updates.preferences.darkModeEnabled !== undefined) profileUpdates.dark_mode_enabled = updates.preferences.darkModeEnabled;
        if (updates.preferences.languagePreference !== undefined) profileUpdates.language_preference = updates.preferences.languagePreference;
        if (updates.preferences.newsCategories !== undefined) profileUpdates.news_categories = updates.preferences.newsCategories;
        if (updates.preferences.autoPlayAudio !== undefined) profileUpdates.auto_play_audio = updates.preferences.autoPlayAudio;
      }

      if (Object.keys(profileUpdates).length === 0) {
        console.log("No profile updates to send.");
        setState(prev => ({...prev, loading: false}));
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', state.user.id)
        .select() // Important to select to get the updated data if needed, or handle RLS issues
        .single(); // If you expect a single row back

      if (error) throw error;

      // Optimistically update local state or refetch user profile for consistency
      // For simplicity, merging updates here. Refetching is more robust.
      setState(prev => {
        if (!prev.user) return { ...prev, loading: false };
        
        // Deep merge preferences
        const updatedPreferences = {
          ...(prev.user.preferences || {}), // Start with existing preferences
          ...(updates.preferences || {}),   // Merge updates.preferences
        };

        return {
          ...prev,
          loading: false,
          error: null,
          user: {
            ...prev.user,
            ...updates, // Spread top-level updates like displayName, photoUrl
            preferences: updatedPreferences as UserPreferences, // Apply merged preferences
          },
        };
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      setState(prev => ({ ...prev, loading: false, error: error?.message || 'Failed to update profile.' }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        session: state.session,
        loading: state.loading,
        authError: state.error, // Expose error specifically
        signIn,
        signUp,
        signOut,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}