import { OmdbMovie } from '../types/movie';

const OMDB_API_KEY = 'ccb3125d';
const BASE_URL = 'https://www.omdbapi.com';
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // You'll need to get this from Google

// Genre corrections and mappings
const GENRE_CORRECTIONS: { [key: string]: string } = {
  'New Nightmare': 'Horror', // Force specific movies to correct genres
  // Add more specific corrections as needed
};

// Movie series/collections mapping
const MOVIE_COLLECTIONS: { [key: string]: string } = {
  'A Nightmare on Elm Street': ['nightmare on elm street', 'new nightmare'],
  'Friday the 13th': ['friday the 13th'],
  'Halloween': ['halloween'],
  // Add more series as needed
};

function findMovieCollection(title: string): string | undefined {
  const lowerTitle = title.toLowerCase();
  return Object.entries(MOVIE_COLLECTIONS).find(([_, keywords]) =>
    keywords.some(keyword => lowerTitle.includes(keyword))
  )?.[0];
}

function correctGenre(title: string, originalGenre: string): string {
  return GENRE_CORRECTIONS[title] || originalGenre;
}

async function fetchTrailer(movieTitle: string, year: string): Promise<string | null> {
  try {
    const query = `${movieTitle} ${year} trailer`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.items?.[0]?.id?.videoId) {
      return data.items[0].id.videoId;
    }
  } catch (error) {
    console.error('Failed to fetch trailer:', error);
  }
  return null;
}

export async function searchMovies(query: string): Promise<OmdbMovie[]> {
  const response = await fetch(
    `${BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
  );
  const data = await response.json();
  
  if (data.Error) {
    return [];
  }

  // Fetch detailed info for each movie
  const detailedMovies = await Promise.all(
    data.Search.slice(0, 5).map((movie: any) => getMovieDetails(movie.imdbID))
  );

  return detailedMovies.filter((movie): movie is OmdbMovie => movie !== null);
}

export async function getMovieDetails(imdbId: string): Promise<OmdbMovie | null> {
  const response = await fetch(
    `${BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
  );
  const data = await response.json();
  
  if (data.Error) {
    return null;
  }

  // Apply genre corrections
  const correctedGenre = correctGenre(data.Title, data.Genre);
  data.Genre = correctedGenre;

  // Add collection information
  const collection = findMovieCollection(data.Title);
  if (collection) {
    data.Collection = collection;
  }

  // Try to fetch trailer
  const trailerId = await fetchTrailer(data.Title, data.Year);
  if (trailerId) {
    data.TrailerId = trailerId;
  }

  return data;
}