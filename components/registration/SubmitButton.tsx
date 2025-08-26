'use client';
import { motion } from 'framer-motion';

export default function SubmitButton() {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <motion.button 
        type="submit"
        className="px-12 py-5 bg-gradient-to-r from-heading to-heading/80 text-white rounded-full text-lg font-medium tracking-wide shadow-2xl font-body"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        Submit Registration
      </motion.button>
    </motion.div>
  );
}
