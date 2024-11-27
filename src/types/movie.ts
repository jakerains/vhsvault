export interface Movie {
  id: string;
  title: string;
  year: string;
  coverUrl: string;
  genre: string[];
  rating?: string;
  plot?: string;
  director?: string;
  actors?: string[];
  addedDate: string;
  imdbId?: string;
  collection?: string;
  trailerId?: string;
  notes?: string;
}

export interface MovieStore {
  movies: Movie[];
  viewMode: 'shelf' | 'list';
  sortBy: 'title' | 'year' | 'rating' | 'addedDate';
  sortOrder: 'asc' | 'desc';
  filterGenre: string | null;
  filterCollection: string | null;
  searchQuery: string;
  addMovie: (movie: Omit<Movie, 'id' | 'addedDate'>) => void;
  removeMovie: (id: string) => void;
  setViewMode: (mode: 'shelf' | 'list') => void;
  setSortBy: (field: 'title' | 'year' | 'rating' | 'addedDate') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilterGenre: (genre: string | null) => void;
  setFilterCollection: (collection: string | null) => void;
  setSearchQuery: (query: string) => void;
  loadMovies: () => Promise<void>;
  updateMovieNotes: (id: string, notes: string) => Promise<void>;
}

export interface OmdbMovie {
  Title: string;
  Year: string;
  Poster: string;
  Genre: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  imdbRating?: string;
  imdbID: string;
  Collection?: string;
  TrailerId?: string;
}