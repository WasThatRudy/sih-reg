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

const staticProblemStatements = [
  {
    id: 1,
    category: "Healthcare",
    title: "AI-Powered Disease Diagnosis System",
    description: "Develop an intelligent system that can analyze medical images and patient data to provide early disease detection and diagnosis recommendations.",
    difficulty: "Advanced",
    techStack: ["Machine Learning", "Computer Vision", "Python", "TensorFlow"],
    prize: "₹1,00,000",
    deadline: "2024-12-31"
  },
  {
    id: 2,
    category: "Agriculture",
    title: "Smart Crop Monitoring & Management",
    description: "Create an IoT-based solution for real-time crop monitoring, soil analysis, and automated irrigation systems to optimize agricultural productivity.",
    difficulty: "Intermediate",
    techStack: ["IoT", "Arduino", "Python", "Cloud Computing"],
    prize: "₹75,000",
    deadline: "2024-12-31"
  },
  {
    id: 3,
    category: "Education",
    title: "Personalized Learning Platform",
    description: "Build an adaptive learning system that personalizes educational content based on student performance, learning style, and pace.",
    difficulty: "Intermediate",
    techStack: ["React", "Node.js", "AI/ML", "MongoDB"],
    prize: "₹80,000",
    deadline: "2024-12-31"
  },
  {
    id: 4,
    category: "Environment",
    title: "Waste Management Optimization",
    description: "Develop a smart waste collection and segregation system using computer vision and IoT to improve recycling efficiency and reduce environmental impact.",
    difficulty: "Advanced",
    techStack: ["Computer Vision", "IoT", "Python", "Cloud Platform"],
    prize: "₹90,000",
    deadline: "2024-12-31"
  },
  {
    id: 5,
    category: "Transportation",
    title: "Traffic Flow Optimization",
    description: "Create an intelligent traffic management system that uses real-time data to optimize signal timing and reduce congestion in urban areas.",
    difficulty: "Advanced",
    techStack: ["Data Analytics", "Machine Learning", "Python", "Real-time Systems"],
    prize: "₹85,000",
    deadline: "2024-12-31"
  },
  {
    id: 6,
    category: "Finance",
    title: "Financial Literacy App",
    description: "Build a mobile application that helps users understand financial concepts, plan investments, and make informed financial decisions.",
    difficulty: "Beginner",
    techStack: ["React Native", "Node.js", "MongoDB", "Financial APIs"],
    prize: "₹60,000",
    deadline: "2024-12-31"
  }
];

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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-heading mx-auto mb-4"></div>
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="font-display text-5xl md:text-7xl font-light mb-8 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-heading">Problem</span>
            <br />
            <span className="text-subheading">Statements</span>
          </motion.h1>
          
          <motion.p 
            className="font-body text-lg text-gray-400 max-w-3xl mx-auto font-light leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Choose from a diverse range of real-world challenges. Each problem statement represents an opportunity to create meaningful impact through innovation.
          </motion.p>
        </div>
      </section>

      {/* Problem Statements Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {problemStatements.length > 0 ? problemStatements.map((problem, index) => (
              <motion.div 
                key={problem._id}
                className="group bg-gray-900/30 border border-gray-800 rounded-2xl p-8 hover:border-heading/30 transition-all duration-500"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-heading/10 text-heading px-3 py-1 rounded-full text-sm font-medium border border-heading/20 tracking-wide">
                      {problem.domain}
                    </span>
                    <span className="bg-subheading/10 text-subheading px-3 py-1 rounded-full text-xs font-medium border border-subheading/20 tracking-wide">
                      {problem.psNumber}
                    </span>
                  </div>
                  <div className="text-heading font-medium text-sm tracking-wide">
                    {problem.teamCount}/{problem.maxTeams} teams
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-light text-white mb-4 group-hover:text-subheading transition-colors duration-300 tracking-wide">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="font-body text-gray-400 text-base mb-6 leading-relaxed tracking-wide">
                  {problem.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-gray-500 text-sm font-body tracking-wide">
                    Status: {problem.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {problem.link && (
                    <motion.a
                      href={problem.link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-heading/10 text-heading rounded-full text-sm font-medium border border-heading/20 hover:bg-heading hover:text-white transition-colors duration-300 tracking-wide"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      View Details
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )) : staticProblemStatements.map((problem, index) => (
              <motion.div 
                key={problem.id}
                className="group bg-gray-900/30 border border-gray-800 rounded-2xl p-8 hover:border-heading/30 transition-all duration-500"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-heading/10 text-heading px-3 py-1 rounded-full text-sm font-medium border border-heading/20 tracking-wide">
                      {problem.category}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-light text-white mb-4 group-hover:text-subheading transition-colors duration-300 tracking-wide">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="font-body text-gray-400 text-base mb-6 leading-relaxed tracking-wide">
                  {problem.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-gray-500 text-sm font-body tracking-wide">
                    Sample Problem Statement
                  </span>
                  <motion.button 
                    className="px-6 py-2 bg-heading/10 text-heading rounded-full text-sm font-medium border border-heading/20 hover:bg-heading hover:text-white transition-colors duration-300 tracking-wide"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

