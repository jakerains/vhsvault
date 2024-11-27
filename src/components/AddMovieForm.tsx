import React, { useState } from 'react';
import { Search, Camera } from 'lucide-react';
import { useMovieStore } from '../store/movieStore';
import { searchMovies } from '../services/omdbApi';
import { CameraScanner } from './CameraScanner';
import { SearchResults } from './SearchResults';
import type { OmdbMovie } from '../types/movie';

export const AddMovieForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<OmdbMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const addMovie = useMovieStore((state) => state.addMovie);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Failed to search movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMovie = (movie: OmdbMovie) => {
    addMovie({
      title: movie.Title,
      year: movie.Year,
      coverUrl: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450',
      genre: movie.Genre.split(', '),
      plot: movie.Plot,
      director: movie.Director,
      actors: movie.Actors.split(', '),
      rating: movie.imdbRating,
      imdbId: movie.imdbID,
      collection: (movie as any).Collection, // Add collection information
    });
    setSearchQuery('');
    setResults([]);
  };

  return (
    <div className="retro-card mb-8">
      {showCamera && <CameraScanner onClose={() => setShowCamera(false)} />}
      <h2 className="text-lg sm:text-2xl font-bold text-purple-400 mb-4 font-['Press_Start_2P']">Add New VHS</h2>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="retro-input w-full"
        />
        <div className="flex gap-2">
          <button type="submit" className="retro-button flex-1 sm:flex-none flex items-center justify-center gap-2">
            <Search size={16} />
            Search
          </button>
          <button 
            type="button" 
            onClick={() => setShowCamera(true)} 
            className="retro-button flex-1 sm:flex-none"
          >
            <Camera size={16} />
          </button>
        </div>
      </form>

      <SearchResults 
        results={results}
        onSelect={handleSelectMovie}
        isLoading={isLoading}
      />
    </div>
  );
};