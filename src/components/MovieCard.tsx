import React from 'react';
import { Trash2, Star, User2, Film, Share2 } from 'lucide-react';
import { Movie } from '../types/movie';
import { useMovieStore } from '../store/movieStore';
import { ShareButton } from './ShareButton';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const removeMovie = useMovieStore((state) => state.removeMovie);

  return (
    <div className="retro-card">
      <button 
        onClick={() => removeMovie(movie.id)}
        className="absolute top-2 right-2 text-purple-400 hover:text-purple-600"
      >
        <Trash2 size={20} />
      </button>
      <div className="flex gap-4">
        <img 
          src={movie.coverUrl} 
          alt={movie.title}
          className="w-32 h-48 object-cover rounded border-2 border-purple-600"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-purple-400">{movie.title}</h3>
          <p className="text-purple-300">{movie.year}</p>
          <div className="mt-2">
            <ShareButton movie={movie} className="text-xs py-1 px-3" />
          </div>
          <p className="text-sm text-purple-200 mt-2">{movie.genre.join(', ')}</p>
          
          <div className="mt-3 space-y-2">
            {movie.rating && (
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Star size={16} className="text-yellow-500" />
                <span>Rating: {movie.rating}</span>
              </div>
            )}
            
            {movie.director && (
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Film size={16} />
                <span>Director: {movie.director}</span>
              </div>
            )}
            
            {movie.actors && (
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <User2 size={16} />
                <span>Cast: {movie.actors.join(', ')}</span>
              </div>
            )}
          </div>

          {movie.plot && (
            <p className="text-sm text-purple-200 mt-3 line-clamp-2">{movie.plot}</p>
          )}
        </div>
      </div>
    </div>
  );
};