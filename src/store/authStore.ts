import { create } from 'zustand';
import { AuthStore } from '../types/auth';
import { supabase } from '../utils/supabase';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ user: null, isLoading: false });
        return;
      }
      if (!user) {
        set({ user: null, isLoading: false });
        return;
      }
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ user: null, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (!data.user) throw new Error('No user data returned');
      set({ user: data.user });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
}));