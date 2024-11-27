import React from 'react';
import { Plus } from 'lucide-react';
import type { OmdbMovie } from '../types/movie';

interface SearchResultsProps {
  results: OmdbMovie[];
  onSelect: (movie: OmdbMovie) => void;
  isLoading: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onSelect,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="mt-4 text-purple-400 text-center">
        <p className="animate-pulse">Searching VHS database...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-xl text-purple-400 font-['Press_Start_2P']">Found Tapes:</h3>
      <div className="grid gap-4">
        {results.map((movie) => (
          <div key={movie.imdbID} className="retro-card flex items-center gap-4">
            <img
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/100x150'}
              alt={movie.Title}
              className="w-20 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-purple-400">{movie.Title}</h4>
              <p className="text-purple-300 text-sm">{movie.Year}</p>
              <p className="text-purple-200 text-sm mt-1">{movie.Genre}</p>
            </div>
            <button
              onClick={() => onSelect(movie)}
              className="retro-button"
            >
              <Plus size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};