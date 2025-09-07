'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface ProblemStatement {
  _id: string;
  psNumber: string;
  title: string;
  description: string;
  domain: string;
  link: string;
  teamCount: number;
  maxTeams: number;
  isActive: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ProblemStatements() {
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const fetchProblemStatements = async () => {
      if (fetched) return;
      
      try {
        const response = await fetch('/api/problem-statements');
        if (response.ok) {
          const data = await response.json();
          setProblemStatements(data.problemStatements || []);
        } else {
          // Fallback to static data if API fails
          setProblemStatements([]);
        }
      } catch (error) {
        console.error('Error fetching problem statements:', error);
        setProblemStatements([]);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    fetchProblemStatements();
  }, [fetched]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 md:h-32 md:w-32 border-b-2 border-heading mx-auto mb-4"></div>
            <p className="text-text font-body">Loading problem statements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="font-display text-4xl sm:text-5xl md:text-7xl font-light mb-6 md:mb-8 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-heading">Problem</span>
            <br />
            <span className="text-subheading">Statements</span>
          </motion.h1>
          
          <motion.p 
            className="font-body text-base md:text-lg text-gray-400 max-w-3xl mx-auto font-light leading-relaxed tracking-wide px-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Choose from a diverse range of real-world challenges. Each problem statement represents an opportunity to create meaningful impact through innovation.
          </motion.p>
        </div>
      </section>

      {/* Problem Statements Grid */}
      <section className="pb-20 md:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {problemStatements.length > 0 ? problemStatements.map((problem) => (
              <motion.div 
                key={problem._id}
                className="group bg-gray-900/30 border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-heading/30 transition-all duration-500"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-heading/10 text-heading px-3 py-1 rounded-full text-sm font-medium border border-heading/20 tracking-wide">
                      {problem.domain}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {problem.psNumber.split('/').map((num, index) => (
                        <span key={index} className="bg-subheading/10 text-subheading px-2 py-1 rounded-full text-xs font-medium border border-subheading/20 tracking-wide">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* REMOVED: Team count is internal admin information - not for public view */}
                  {/* <div className="text-heading font-medium text-sm tracking-wide">
                    {problem.teamCount}/{problem.maxTeams} teams
                  </div> */}
                </div>

                {/* Title */}
                <h3 className="font-display text-xl sm:text-2xl font-light text-white mb-4 group-hover:text-subheading transition-colors duration-300 tracking-wide break-words leading-tight">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="font-body text-gray-400 text-sm md:text-base mb-6 leading-snug md:leading-relaxed tracking-wide break-words">
                  {problem.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  {/* REMOVED: PS status (Active/Inactive) is internal admin information - not for public view */}
                  {/* <span className="text-gray-500 text-sm font-body tracking-wide">
                    Status: {problem.isActive ? 'Active' : 'Inactive'}
                  </span> */}
                  <div></div> {/* Spacer to maintain layout */}
                  {problem.link && (
                    <motion.a
                      href={problem.link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 md:px-6 md:py-2 bg-heading/10 text-heading rounded-full text-xs md:text-sm font-medium border border-heading/20 hover:bg-heading hover:text-white transition-colors duration-300 tracking-wide"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      View Details
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="col-span-1 lg:col-span-2 text-center py-12">
                <p className="font-body text-gray-400 text-sm md:text-base">No problem statements to show.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

