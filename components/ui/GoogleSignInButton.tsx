'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface GoogleSignInButtonProps {
  onSignIn: () => Promise<void>;
  text?: string;
  isLoading?: boolean;
}

export default function GoogleSignInButton({ onSignIn, text = "Continue with Google", isLoading: externalLoading }: GoogleSignInButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Use external loading state if provided, otherwise use internal state
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleClick = async () => {
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }
    try {
      await onSignIn();
    } catch (error: any) {
      // Only reset internal loading state if it's not a popup closed error
      if (externalLoading === undefined && error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        setInternalLoading(false);
      }
      // Re-throw the error so parent can handle it
      throw error;
    } finally {
      // Only reset internal loading if no external loading state is provided
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full py-4 px-6 border border-gray-600 rounded-lg text-white font-medium tracking-wide font-body transition-all duration-300 flex items-center justify-center gap-3 ${
        isLoading 
          ? 'bg-gray-700 cursor-not-allowed' 
          : 'bg-gray-800/50 hover:bg-gray-700/50 hover:border-gray-500'
      }`}
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.98 } : {}}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{isLoading ? 'Signing in...' : text}</span>
    </motion.button>
  );
}

