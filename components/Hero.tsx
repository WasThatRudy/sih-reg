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
    </section>
  );
}
