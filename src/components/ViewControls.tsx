import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  SortAsc, 
  SortDesc, 
  Filter,
  Search, 
  Share2,
  X
} from 'lucide-react';
import { useMovieStore } from '../store/movieStore';
import { ShareButton } from './ShareButton';
import { CameraScanner } from './CameraScanner';

export const ViewControls: React.FC = () => {
  const {
    viewMode,
    sortBy,
    sortOrder,
    filterGenre,
    filterCollection,
    searchQuery,
    setViewMode,
    setSortBy,
    setSortOrder,
    setFilterGenre,
    setFilterCollection,
    setSearchQuery,
    movies,
  } = useMovieStore();
  const [showScanner, setShowScanner] = useState(false);

  const genres = React.useMemo(() => 
    Array.from(new Set(movies.flatMap(m => m.genre))).sort(),
    [movies]
  );

  const collections = React.useMemo(() => 
    Array.from(new Set(movies.map(m => m.collection).filter(Boolean))).sort(),
    [movies]
  );

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-6 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-900/50">
      {/* View Toggle */}
      <div className="flex gap-1 justify-center sm:justify-start">
        <button
          className={`p-2 rounded ${viewMode === 'shelf' ? 'bg-purple-700' : 'bg-purple-900/50 hover:bg-purple-800/50'}`}
          onClick={() => setViewMode('shelf')}
          title="Shelf View"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-700' : 'bg-purple-900/50 hover:bg-purple-800/50'}`}
          onClick={() => setViewMode('list')}
          title="List View"
        >
          <List size={16} />
        </button>
      </div>

      <div className="hidden sm:block h-6 w-px bg-purple-700/30" />

      {/* Sort Controls */}
      <div className="flex items-center gap-1 w-full sm:w-auto">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="flex-1 sm:flex-none bg-purple-900/50 text-sm border-none rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
        >
          <option value="title">Title</option>
          <option value="year">Year</option>
          <option value="rating">Rating</option>
          <option value="addedDate">Added</option>
        </select>
        <button
          className="p-2 rounded bg-purple-900/50 hover:bg-purple-800/50"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
        </button>
      </div>

      <div className="hidden sm:block h-6 w-px bg-purple-700/30" />

      {/* Filters */}
      <div className="flex items-center gap-1 w-full sm:w-auto">
        <Filter size={14} className="text-purple-400" />
        <select
          value={filterGenre || ''}
          onChange={(e) => setFilterGenre(e.target.value || null)}
          className="flex-1 sm:flex-none bg-purple-900/50 text-sm border-none rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <select
          value={filterCollection || ''}
          onChange={(e) => setFilterCollection(e.target.value || null)}
          className="flex-1 sm:flex-none bg-purple-900/50 text-sm border-none rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
        >
          <option value="">All Collections</option>
          {collections.map((collection) => (
            <option key={collection} value={collection}>{collection}</option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-purple-700/30" />

      {/* Search */}
      <div className="flex-1 relative min-w-[200px]">
        <input
          type="text"
          placeholder="Search collection..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-purple-900/50 text-sm border-none rounded pl-8 pr-8 py-1 focus:ring-1 focus:ring-purple-500"
        />
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {movies.length > 0 && (
        <>
          <div className="h-6 w-px bg-purple-700/30" />
          <ShareButton movies={movies} />
        </>
      )}
      
      {showScanner && <CameraScanner onClose={() => setShowScanner(false)} />}
    </div>
  );
};