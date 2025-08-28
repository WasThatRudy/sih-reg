'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Notification({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: NotificationProps) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && autoClose) {
      const id = setTimeout(() => {
        onClose();
      }, duration);
      setTimeoutId(id);
      
      return () => {
        if (id) clearTimeout(id);
      };
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, autoClose, duration, onClose, timeoutId]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500/10 to-green-400/10',
          border: 'border-green-500/20',
          text: 'text-green-400',
          icon: '✅'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/10 to-red-400/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/10 to-yellow-400/10',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          icon: '⚠️'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500/10 to-blue-400/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          icon: 'ℹ️'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500/10 to-gray-400/10',
          border: 'border-gray-500/20',
          text: 'text-gray-400',
          icon: '📢'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 backdrop-blur-sm shadow-lg`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{styles.icon}</span>
              <div className="flex-1">
                <p className={`${styles.text} font-body text-sm font-medium`}>
                  {message}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200 ml-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
