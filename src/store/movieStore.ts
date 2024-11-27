import { create } from 'zustand';
import { Movie, MovieStore } from '../types/movie';
import { saveMovieToSupabase, deleteMovieFromSupabase, fetchUserMovies } from '../utils/supabase';
import { notifyMovieAdded } from '../utils/notifications';

export const useMovieStore = create<MovieStore>((set, get) => ({
  movies: [],
  viewMode: 'shelf',
  sortBy: 'addedDate',
  sortOrder: 'desc',
  filterGenre: null,
  filterCollection: null,
  searchQuery: '',

  updateMovieNotes: async (id, notes) => {
    const movie = get().movies.find(m => m.id === id);
    if (movie) {
      const updatedMovie = { ...movie, notes };
      try {
        await saveMovieToSupabase(updatedMovie);
        set(state => ({
          movies: state.movies.map(m => m.id === id ? updatedMovie : m)
        }));
      } catch (error) {
        console.error('Failed to update movie notes:', error instanceof Error ? error.message : error);
        // Optionally show user feedback here
      }
    }
  },

  addMovie: async (movieData) => {
    try {
      const movie = {
        ...movieData,
        id: crypto.randomUUID(),
        addedDate: new Date().toISOString(),
      };
      await saveMovieToSupabase(movie);
      set((state) => ({
        movies: [...state.movies, movie],
      }));
      await notifyMovieAdded(movie);
    } catch (error) {
      console.error('Failed to add movie:', error);
      throw error;
    }
  },

  removeMovie: async (id) => {
    try {
      await deleteMovieFromSupabase(id);
      set((state) => ({
        movies: state.movies.filter((movie) => movie.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove movie:', error);
      throw error;
    }
  },

  loadMovies: async () => {
    try {
      const movies = await fetchUserMovies();
      set({ movies: Array.isArray(movies) ? movies : [] });
    } catch (error) {
      console.error('Failed to load movies:', error instanceof Error ? error.message : error);
      set({ movies: [] });
      throw error;
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setFilterGenre: (genre) => set({ filterGenre: genre }),
  setFilterCollection: (collection) => set({ filterCollection: collection }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));