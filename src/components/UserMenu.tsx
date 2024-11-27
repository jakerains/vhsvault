import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserProfileStore } from '../store/userProfileStore';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuthStore();
  const { profile, loadProfile } = useUserProfileStore();

  // Load profile on mount
  useEffect(() => {
    const initProfile = async () => {
      try {
        await loadProfile();
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    initProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-900/50 hover:bg-purple-800/50 transition-colors"
      >
        <User size={16} className="text-purple-300" />
        <span className="text-purple-300 truncate max-w-[150px]">
          {profile?.username || (profile?.email && profile.email.split('@')[0]) || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-black border-2 border-purple-600 shadow-lg overflow-hidden">
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-purple-300 hover:bg-purple-900/50"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              View Profile
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-purple-300 hover:bg-purple-900/50"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};