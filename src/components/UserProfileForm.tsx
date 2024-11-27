import React, { useState, useEffect } from 'react';
import { Save, User, Film, Clock, Settings } from 'lucide-react';
import { useUserProfileStore } from '../store/userProfileStore';
import type { UserProfile } from '../types/user';

const PLATFORMS = ['Netflix', 'HBO Max', 'Amazon Prime', 'Disney+', 'Hulu', 'Apple TV+'];
const WATCHING_TIMES = ['Morning', 'Afternoon', 'Evening', 'Late Night', 'Weekends'];
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary'];

export const UserProfileForm: React.FC = () => {
  const { profile, updateProfile, isLoading, error } = useUserProfileStore();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    moviePreferences: {
      favoriteGenres: [],
      watchingPlatforms: [],
      moviesPerMonth: 0,
      favoriteMovies: [],
      preferredWatchingTime: [],
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    window.location.href = '/';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: string, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      moviePreferences: {
        ...prev.moviePreferences,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="retro-card space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <User size={24} className="text-purple-400" />
        <h2 className="text-2xl font-bold text-purple-400 font-['Press_Start_2P']">Profile</h2>
      </div>

      {error && (
        <div className="bg-red-900/50 border-2 border-red-500 rounded p-3 text-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-purple-300 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="retro-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="retro-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="retro-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="retro-input w-full h-24"
              maxLength={250}
            />
          </div>
        </div>

        {/* Movie Preferences */}
        <div className="space-y-4">
          <div>
            <label className="block text-purple-300 mb-2">Favorite Genres</label>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map(genre => (
                <label key={genre} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.moviePreferences?.favoriteGenres.includes(genre)}
                    onChange={(e) => {
                      const current = formData.moviePreferences?.favoriteGenres || [];
                      handleArrayChange(
                        'favoriteGenres',
                        e.target.checked
                          ? [...current, genre]
                          : current.filter(g => g !== genre)
                      );
                    }}
                    className="retro-checkbox"
                  />
                  <span className="text-purple-200">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-purple-300 mb-2">Watching Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(platform => (
                <label key={platform} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.moviePreferences?.watchingPlatforms.includes(platform)}
                    onChange={(e) => {
                      const current = formData.moviePreferences?.watchingPlatforms || [];
                      handleArrayChange(
                        'watchingPlatforms',
                        e.target.checked
                          ? [...current, platform]
                          : current.filter(p => p !== platform)
                      );
                    }}
                    className="retro-checkbox"
                  />
                  <span className="text-purple-200">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-purple-300 mb-2">Movies per Month</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.moviePreferences?.moviesPerMonth}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  moviePreferences: {
                    ...prev.moviePreferences,
                    moviesPerMonth: parseInt(e.target.value) || 0,
                  },
                }));
              }}
              className="retro-input w-full"
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2">Preferred Watching Time</label>
            <div className="grid grid-cols-2 gap-2">
              {WATCHING_TIMES.map(time => (
                <label key={time} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.moviePreferences?.preferredWatchingTime.includes(time)}
                    onChange={(e) => {
                      const current = formData.moviePreferences?.preferredWatchingTime || [];
                      handleArrayChange(
                        'preferredWatchingTime',
                        e.target.checked
                          ? [...current, time]
                          : current.filter(t => t !== time)
                      );
                    }}
                    className="retro-checkbox"
                  />
                  <span className="text-purple-200">{time}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="retro-button w-full flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};