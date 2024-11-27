import { create } from 'zustand';
import { UserProfile, UserProfileStore } from '../types/user';
import { supabase, getCurrentUser } from '../utils/supabase';

export const useUserProfileStore = create<UserProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');

      const profile = {
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        moviePreferences: data.movie_preferences,
        themePreferences: data.theme_preferences,
        privacySettings: data.privacy_settings,
        email: user.email
      };

      set({ profile, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load profile:', error.message);
      set({ 
        error: error.message || 'Failed to load profile', 
        isLoading: false,
        profile: null
      });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      // Transform camelCase to snake_case
      const dbUpdates = {
        ...updates,
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
        movie_preferences: updates.moviePreferences,
        theme_preferences: updates.themePreferences,
        privacy_settings: updates.privacySettings
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...dbUpdates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      set(state => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updatePrivacySettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_profiles')
        .update({ privacy_settings: settings })
        .eq('id', user.id);

      if (error) throw error;
      set(state => ({
        profile: state.profile ? { ...state.profile, privacySettings: settings } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (get().profile as UserProfile).id
      );
      if (error) throw error;
      set({ profile: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));