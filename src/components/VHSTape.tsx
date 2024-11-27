import React, { useState } from 'react';
import { Movie } from '../types/movie';
import { MovieDetails } from './MovieDetails';

interface VHSTapeProps {
  movie: Movie;
}

export const VHSTape: React.FC<VHSTapeProps> = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="relative">
        {/* VHS Case */}
        <div
          className="group relative h-[180px] w-[110px] cursor-pointer transition-all duration-300 hover:scale-105 perspective-1000"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setShowModal(true)}
        >
          {/* VHS Case Spine (visible when on shelf) */}
          <div className="absolute inset-0 bg-black shadow-lg transform group-hover:-rotate-6 transition-transform duration-300">
            {/* Movie Cover Art */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${movie.coverUrl})` }}
            >
              {/* Overlay to make it look like a VHS case */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent">
                {/* VHS Case Details */}
                <div className="absolute inset-0 flex flex-col justify-between p-2">
                  {/* Movie Title */}
                  <div className="bg-black/80 p-1 rounded">
                    <div className="text-[10px] font-bold text-purple-300 truncate">
                      {movie.title}
                    </div>
                    <div className="text-[8px] text-purple-400">
                      {movie.year}
                    </div>
                  </div>
                </div>

                {/* VHS Case Edge Lines */}
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-purple-600/20 via-purple-600/40 to-purple-600/20" />
                <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-purple-600/20 via-purple-600/40 to-purple-600/20" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/20 via-purple-600/40 to-purple-600/20" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/20 via-purple-600/40 to-purple-600/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Hover Preview */}
        {isHovered && !showModal && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px]">
            <MovieDetails movie={movie} />
          </div>
        )}
      </div>

      {/* Full Modal */}
      {showModal && (
        <MovieDetails 
          movie={movie} 
          isModal={true}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};