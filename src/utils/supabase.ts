import { createClient } from '@supabase/supabase-js';
import type { Movie } from '../types/movie';

const supabaseUrl = 'https://qjvbbmmaeyikdrjcovei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdmJibW1hZXlpa2RyamNvdmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNjMwMTMsImV4cCI6MjA0NzYzOTAxM30.Jhblzs13BsQO3QLodVSyST2YwQlk1I0avEYnorJIyh4';

// Initialize Supabase client with retries
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'vhs-vault-auth'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
    fetch: async (url: string, options: RequestInit = {}) => {
      const maxRetries = 3;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          const response = await fetch(url, options);
          if (response.ok) return response;
          if (response.status === 401) break; // Don't retry auth errors
          attempt++;
        } catch (error) {
          if (attempt === maxRetries - 1) throw error;
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      return fetch(url, options);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Add error handling wrapper
async function handleSupabaseError<T>(promise: Promise<{ data: T | null; error: any }>): Promise<T> {
  try {
    const { data, error } = await promise;
    if (error) throw error;
    if (!data) throw new Error('No data returned');
    return data;
  } catch (error: any) {
    console.error('Supabase operation failed:', error.message || error);
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user) {
      console.warn('No authenticated user found');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
}

// Movie operations with Supabase
export async function saveMovieToSupabase(movie: Movie) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('movies')
    .upsert([{
      id: movie.id,
      user_id: user.id,
      title: movie.title,
      year: movie.year,
      cover_url: movie.coverUrl,
      genre: movie.genre,
      rating: movie.rating,
      plot: movie.plot,
      director: movie.director,
      actors: movie.actors,
      added_date: movie.addedDate,
      imdb_id: movie.imdbId,
      collection: movie.collection,
      trailer_id: movie.trailerId,
      notes: movie.notes,
    }], {
      onConflict: 'id'
    });
  return { data, error };
}

export async function deleteMovieFromSupabase(id: string) {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id)
    .eq('user_id', (await getCurrentUser())?.id);
  return { error };
}

export async function fetchUserMovies() {
  const user = await getCurrentUser();
  if (!user) {
    console.error('No authenticated user found');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  
    return (data || []).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      coverUrl: movie.cover_url,
      genre: movie.genre || [],
      rating: movie.rating,
      plot: movie.plot,
      director: movie.director,
      actors: movie.actors || [],
      addedDate: movie.added_date,
      imdbId: movie.imdb_id,
      collection: movie.collection,
      trailerId: movie.trailer_id,
      notes: movie.notes,
    }));
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    return [];
  }
}