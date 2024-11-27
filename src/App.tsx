import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { AddMovieForm } from './components/AddMovieForm';
import { VHSShelf } from './components/VHSShelf';
import { MovieList } from './components/MovieList';
import { ViewControls } from './components/ViewControls';
import { PWAPrompt } from './components/PWAPrompt';
import { UserProfile } from './components/UserProfile';
import { AuthForm } from './components/AuthForm';
import { UserMenu } from './components/UserMenu';
import { useMovieStore } from './store/movieStore';
import { useAuthStore } from './store/authStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen text-white p-8">
      <div className="scanline" />
      <div className="crt-effect">
        <header className="text-center mb-8">
          <div className="absolute top-4 right-4">
            <UserMenu />
          </div>
          <Link to="/" className="flex items-center justify-center gap-4">
            <Film size={64} className="text-purple-500" />
            <h1 className="text-4xl font-bold text-purple-500 font-['Press_Start_2P']">VHS Vault</h1>
          </Link>
          <p className="text-purple-300 mt-4 text-xl">Your Digital VHS Collection</p>
        </header>
        <main className="max-w-6xl mx-auto">
          {children}
        </main>
      </div>
      <PWAPrompt />
    </div>
  );
};

const Home: React.FC = () => {
  const {
    movies,
    viewMode,
    sortBy,
    sortOrder,
    filterGenre,
    filterCollection,
    searchQuery,
  } = useMovieStore();

  const filteredMovies = React.useMemo(() => {
    return movies
      .filter((movie) => {
        const matchesGenre = !filterGenre || movie.genre.includes(filterGenre);
        const matchesCollection = !filterCollection || movie.collection === filterCollection;
        const matchesSearch = !searchQuery || 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.actors?.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesGenre && matchesCollection && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'year':
            comparison = parseInt(a.year) - parseInt(b.year);
            break;
          case 'rating':
            comparison = (parseFloat(a.rating || '0') - parseFloat(b.rating || '0'));
            break;
          case 'addedDate':
            comparison = new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [movies, sortBy, sortOrder, filterGenre, filterCollection, searchQuery]);

  return (
    <>
      <AddMovieForm />
      <ViewControls />
      {viewMode === 'shelf' ? (
        <VHSShelf movies={filteredMovies} />
      ) : (
        <MovieList movies={filteredMovies} />
      )}
    </>
  );
};

export default function App() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const {
    movies,
    loadMovies,
    viewMode,
    sortBy,
    sortOrder,
    filterGenre,
    filterCollection,
    searchQuery,
  } = useMovieStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      if (user) {
        await loadMovies();
      }
    };
    init();
  }, [checkAuth, loadMovies, user]);

  const filteredMovies = React.useMemo(() => {
    return movies
      .filter((movie) => {
        const matchesGenre = !filterGenre || movie.genre.includes(filterGenre);
        const matchesCollection = !filterCollection || movie.collection === filterCollection;
        const matchesSearch = !searchQuery || 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.actors?.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesGenre && matchesCollection && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'year':
            comparison = parseInt(a.year) - parseInt(b.year);
            break;
          case 'rating':
            comparison = (parseFloat(a.rating || '0') - parseFloat(b.rating || '0'));
            break;
          case 'addedDate':
            comparison = new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [movies, sortBy, sortOrder, filterGenre, filterCollection, searchQuery]);

  if (isLoading) return null;
  
  if (!user) return <AuthForm />;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}