'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';

export default function Navbar() {
  const { user, signOut, loading, hasTeam } = useAuth();
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-gray-800/30"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://www.pointblank.club/_next/static/media/logo.8d55ed6e.svg" alt="DSCE Logo" width={150} height={10} />
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                href="/problem-statements"
                className="text-gray-300 hover:text-subheading transition-colors duration-300 tracking-wide font-body text-sm"
              >
                Problem Statements
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link 
                href={hasTeam ? "/team-info" : "/registration"}
                className={`${hasTeam ? 'text-gray-300 hover:text-subheading' : 'text-gray-300 hover:text-heading'} transition-colors duration-300 tracking-wide font-body text-sm`}
              >
                {hasTeam ? "Team Info" : "Registration"}
              </Link>
            </motion.div>

            {/* Auth Links - Only show sign out when logged in */}
            {!loading && user && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm font-body">
                  Welcome, {user.displayName || user.email}
                </span>
                <motion.button
                  onClick={() => signOut()}
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-gray-300 hover:text-red-400 transition-colors duration-300 tracking-wide font-body text-sm"
                >
                  Sign Out
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

