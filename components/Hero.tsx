'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import StatusBanner from './StatusBanner';

export default function Hero() {
  const { user, hasTeam } = useAuth();

  const getStartedLink = () => {
    if (!user) return '/login';
    if (hasTeam) return '/team-info';
    return '/registration';
  };

  const getStartedText = () => {
    if (!user) return 'Login to Start';
    if (hasTeam) return 'View Team Info';
    return 'Register Team';
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-heading/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-subheading/5 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-8xl mx-auto">
        {/* Logo */}
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* Option 1: Vertical Stack with Partnership Text */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 mb-3">
              <Image 
                src="https://www.pointblank.club/_next/static/media/logo.8d55ed6e.svg" 
                alt="PointBlank Logo" 
                width={120} 
                height={60}
                className="w-72 h-16"
              /> 
              {/* <Image 
                src="/DSCElogo.svg" 
                alt="DSCE Logo" 
                width={80} 
                height={80}
                className="w-32 h-32"
              /> */}
            </div>
          </div>
        </motion.div>

        {/* Main heading with sophisticated typography */}
        <motion.h1 
          className="font-display text-5xl md:text-7xl lg:text-8xl font-light mb-8 leading-[0.9] tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.span 
            className="text-heading block font-light"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Smart India Hackathon
          </motion.span>
          <motion.span 
            className="text-subheading block font-light"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            Internal Round
          </motion.span>
        </motion.h1>

        {/* Date */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="relative inline-block group mt-3">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-heading/20 to-subheading/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
            
            {/* Main date container */}
            <div className="relative px-8 py-4 bg-gradient-to-r from-heading/5 via-background to-subheading/5 rounded-full border border-heading/30 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
              {/* Decorative elements */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-heading/40 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-subheading/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Date text with enhanced typography */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-heading/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-heading to-subheading bg-clip-text text-transparent tracking-wide">
                  21st September 2025
                </span>
                <svg className="w-5 h-5 text-subheading/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-6xl mx-auto px-6 text-left mt-20"
        >
          <StatusBanner />
        </motion.div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 bg-heading rounded-full"
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-3 h-3 bg-subheading rounded-full"
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Centered bouncing arrow to Instructions */}
      <Link href="#instructions" className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-subheading px-4">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs sm:text-sm md:text-base text-center leading-tight">
            <span className="block sm:inline">please read instructions</span>
            <span className="block sm:inline sm:ml-1">before registering</span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </Link>
    </section>
  );
}
