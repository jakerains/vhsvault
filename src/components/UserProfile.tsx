import React, { useEffect } from 'react';
import { useUserProfileStore } from '../store/userProfileStore';
import { UserProfileForm } from './UserProfileForm';
import { useNavigate } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { loadProfile, isLoading, error } = useUserProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return <div className="text-center text-purple-400">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="retro-button"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-purple-400 font-['Press_Start_2P']">Profile</h2>
      <UserProfileForm />
    </div>
  );
};