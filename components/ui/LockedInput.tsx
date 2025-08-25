'use client';
import { motion } from 'framer-motion';

interface LockedInputProps {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function LockedInput({
  label,
  value,
  className = '',
  icon
}: LockedInputProps) {
  return (
    <div className={className}>
      <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-4 py-3 bg-gray-800/30 border border-gray-600 rounded-lg text-gray-300 font-body cursor-not-allowed"
          style={{ userSelect: 'none' }}
        />
        
        {/* Lock icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </motion.svg>
        </div>
      </div>
      
      {/* Locked message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="mt-2 text-xs text-gray-500 font-body flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Pre-filled from your account
      </motion.div>
    </div>
  );
}

