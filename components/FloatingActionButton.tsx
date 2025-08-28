'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, hasTeam } = useAuth();

  const quickActions = [
    {
      label: 'Problem Statements',
      href: '/problem-statements',
      icon: '📋',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: hasTeam ? 'Team Info' : 'Register Team',
      href: hasTeam ? '/team-info' : '/registration',
      icon: hasTeam ? '👥' : '✍️',
      color: hasTeam ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'
    },
    {
      label: user ? 'Dashboard' : 'Login',
      href: user ? (hasTeam ? '/team-info' : '/registration') : '/login',
      icon: user ? '🏠' : '🔑',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col gap-3 mb-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="group"
                >
                  <motion.div
                    className={`flex items-center gap-3 bg-gradient-to-r ${action.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]`}
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="font-medium text-sm whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-heading to-subheading text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </motion.button>
    </div>
  );
}
