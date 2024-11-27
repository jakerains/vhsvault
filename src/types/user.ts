export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  moviePreferences: {
    favoriteGenres: string[];
    watchingPlatforms: string[];
    moviesPerMonth: number;
    favoriteMovies: string[];
    preferredWatchingTime: string[];
  };
  privacySettings: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showWatchHistory: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  loadProfile: () => Promise<void>;
  updatePrivacySettings: (settings: UserProfile['privacySettings']) => Promise<void>;
  deleteAccount: () => Promise<void>;
}