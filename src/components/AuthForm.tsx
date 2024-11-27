import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Film, LogIn, UserPlus } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="scanline" />
      <div className="crt-effect" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <Film size={48} className="text-purple-500" />
            <h1 className="text-6xl font-bold text-purple-500 font-['Press_Start_2P']">
              VHS Vault
            </h1>
          </div>
          <p className="text-purple-300 mt-4 text-xl">Your Digital VHS Collection</p>
        </div>

        <form onSubmit={handleSubmit} className="retro-card space-y-6">
          <h2 className="text-2xl font-bold text-purple-400 font-['Press_Start_2P'] text-center mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-900/50 border-2 border-red-500 rounded p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="retro-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-purple-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="retro-input w-full"
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="retro-button w-full flex items-center justify-center gap-2">
            {isSignUp ? (
              <>
                <UserPlus size={16} />
                Sign Up
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};