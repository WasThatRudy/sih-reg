'use client';
import { motion } from 'framer-motion';

export default function CallToAction() {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-heading/3 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="font-display text-4xl md:text-6xl font-light mb-8 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-heading">Ready to</span>
            <br />
            <span className="text-subheading">Innovate?</span>
          </motion.h2>
          
          <motion.p 
            className="font-body text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join thousands of innovators across India. Your next big idea could change the world.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button 
            className="group relative px-12 py-5 bg-gradient-to-r from-heading to-heading/80 text-white rounded-full text-lg font-medium overflow-hidden shadow-2xl tracking-wide"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
            <span className="relative flex items-center justify-center gap-3 font-body">
              Start Your Journey
              <motion.svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </span>
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-heading rounded-full"></div>
            <span className="font-body tracking-wide">Free Registration</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-subheading rounded-full"></div>
            <span className="font-body tracking-wide">24/7 Support</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-heading rounded-full"></div>
            <span className="font-body tracking-wide">Global Recognition</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
