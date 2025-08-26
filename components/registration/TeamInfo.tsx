'use client';
import { motion } from 'framer-motion';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface TeamInfoProps {
  teamName: string;
  problemStatement: string;
  onInputChange: (section: string, field: string, value: string) => void;
}

const problemStatements = [
  {
    value: "ai-disease-diagnosis",
    label: "AI-Powered Disease Diagnosis System",
    description: "Develop an intelligent system that can analyze medical images and patient data to provide early disease detection and diagnosis recommendations."
  },
  {
    value: "smart-agriculture",
    label: "Smart Crop Monitoring & Management",
    description: "Create an IoT-based solution for real-time crop monitoring, soil analysis, and automated irrigation systems to optimize agricultural productivity."
  },
  {
    value: "personalized-learning",
    label: "Personalized Learning Platform",
    description: "Build an adaptive learning system that personalizes educational content based on student performance, learning style, and pace."
  },
  {
    value: "waste-management",
    label: "Waste Management Optimization",
    description: "Develop a smart waste collection and segregation system using computer vision and IoT to improve recycling efficiency."
  },
  {
    value: "traffic-optimization",
    label: "Traffic Flow Optimization",
    description: "Create an intelligent traffic management system that uses real-time data to optimize signal timing and reduce congestion."
  },
  {
    value: "financial-literacy",
    label: "Financial Literacy App",
    description: "Build a mobile application that helps users understand financial concepts, plan investments, and make informed financial decisions."
  }
];

export default function TeamInfo({ teamName, problemStatement, onInputChange }: TeamInfoProps) {
  return (
    <motion.div 
      className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <h2 className="font-display text-2xl font-light text-white mb-6 tracking-wide">Team Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => onInputChange('', 'teamName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-heading focus:outline-none transition-colors duration-300 font-body"
            placeholder="Enter your team name"
            required
          />
        </div>
        <div>
          <CustomDropdown
            options={problemStatements}
            value={problemStatement}
            onChange={(value) => onInputChange('', 'problemStatement', value)}
            label="Problem Statement"
            placeholder="Select a problem statement"
          />
        </div>
      </div>
    </motion.div>
  );
}
