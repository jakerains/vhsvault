import React from 'react';
import { Share2 } from 'lucide-react';
import { Movie } from '../types/movie';
import { shareMovie, shareCollection } from '../utils/share';

interface ShareButtonProps {
  movie?: Movie;
  movies?: Movie[];
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ movie, movies, className = '' }) => {
  if (!navigator.share) return null;

  const handleShare = async () => {
    if (movie) {
      await shareMovie(movie);
    } else if (movies) {
      await shareCollection(movies);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`retro-button flex items-center gap-2 ${className}`}
      title="Share"
    >
      <Share2 size={16} />
      Share
    </button>
  );
};