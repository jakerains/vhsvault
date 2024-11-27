import React, { useState, useEffect } from 'react';
import { Star, User2, Film, X, Calendar, Clock, Award, Tag, Youtube, StickyNote } from 'lucide-react';
import YouTube from 'react-youtube';
import { Movie } from '../types/movie';
import { useMovieStore } from '../store/movieStore';

interface MovieDetailsProps {
  movie: Movie;
  isModal?: boolean;
  onClose?: () => void;
}

export const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, isModal, onClose }) => {
  const [notes, setNotes] = useState(movie.notes || '');
  const updateMovieNotes = useMovieStore(state => state.updateMovieNotes);
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleNotesBlur = () => {
    if (notes !== movie.notes) {
      updateMovieNotes(movie.id, notes);
    }
  };

  if (!isModal) {
    return (
      <div className="retro-card animate-float">
        <div className="flex gap-4">
          <img
            src={movie.coverUrl}
            alt={movie.title}
            className="w-24 h-36 object-cover rounded"
          />
          <div>
            <h3 className="text-xl font-bold text-purple-400">{movie.title}</h3>
            <p className="text-purple-300">{movie.year}</p>
            <p className="text-sm text-purple-200 mt-1">{movie.genre.join(', ')}</p>
            {movie.rating && (
              <div className="flex items-center gap-2 mt-2">
                <Star size={16} className="text-yellow-500" />
                <span className="text-purple-300">{movie.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="scanline" />
      <div className="crt-effect" />
      
      <div className="retro-card w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-purple-300"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Left Column - Poster */}
          <div>
            <img
              src={movie.coverUrl}
              alt={movie.title}
              className="w-full rounded-lg border-4 border-purple-600 shadow-lg"
            />
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-purple-400 mb-2">{movie.title}</h2>
              <div className="flex flex-wrap gap-4 text-purple-300">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{movie.year}</span>
                </div>
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span>{movie.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {movie.genre && (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <Tag size={20} />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genre.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.plot && (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-400">Plot</h3>
                <p className="text-purple-200 leading-relaxed">{movie.plot}</p>
              </div>
            )}

            {movie.director && (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <Film size={20} />
                  Director
                </h3>
                <p className="text-purple-200">{movie.director}</p>
              </div>
            )}

            {movie.actors && (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <User2 size={20} />
                  Cast
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.actors.map((actor) => (
                    <span
                      key={actor}
                      className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.trailerId && (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <Youtube size={20} />
                  Trailer
                </h3>
                <div className="aspect-video">
                  <YouTube
                    videoId={movie.trailerId}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 0,
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <StickyNote size={20} />
                Notes
              </h3>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                onBlur={handleNotesBlur}
                placeholder="Add your personal notes about this movie..."
                className="w-full h-32 bg-purple-900/30 border-2 border-purple-600 rounded-lg p-3 text-purple-200 placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};