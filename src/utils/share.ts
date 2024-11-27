import { Movie } from '../types/movie';

export async function shareMovie(movie: Movie): Promise<boolean> {
  if (!navigator.share) {
    console.log('Web Share API not supported');
    return false;
  }

  try {
    const shareData = {
      title: `VHS Vault - ${movie.title}`,
      text: `Check out ${movie.title} (${movie.year}) in my VHS collection!`,
      url: `${window.location.origin}/movie/${movie.id}`,
      files: []
    };

    // Add movie poster if available and File API is supported
    if (movie.coverUrl && window.File) {
      try {
        const response = await fetch(movie.coverUrl);
        const blob = await response.blob();
        const file = new File([blob], 'movie-poster.jpg', { type: 'image/jpeg' });
        shareData.files = [file];
      } catch (error) {
        console.warn('Failed to attach movie poster to share:', error);
      }
    }

    await navigator.share({
      ...shareData
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error sharing movie:', error);
    }
    return false;
  }
}

export async function shareCollection(movies: Movie[]): Promise<boolean> {
  if (!navigator.share) return false;

  const moviesList = movies.map(m => `- ${m.title} (${m.year})`).join('\n');
  const text = movies.length === 1
    ? `Check out this movie in my VHS collection!`
    : `Check out my VHS collection with ${movies.length} movies!\n\n${moviesList}`;

  try {
    await navigator.share({
      title: 'VHS Vault Collection',
      text,
      url: window.location.origin
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error sharing collection:', error);
    }
    return false;
  }
}