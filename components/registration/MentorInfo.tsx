'use client';
import { motion } from 'framer-motion';

interface MentorData {
  name: string;
  email: string;
  phone: string;
  designation: string;
}

interface MentorInfoProps {
  mentor: MentorData;
  onInputChange: (section: string, field: string, value: string) => void;
}

export default function MentorInfo({ mentor, onInputChange }: MentorInfoProps) {
  return (
    <motion.div 
      className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <h2 className="font-display text-2xl font-light text-white mb-6 tracking-wide">Mentor Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">Full Name</label>
          <input
            type="text"
            value={mentor.name}
            onChange={(e) => onInputChange('mentor', 'name', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-heading focus:outline-none transition-colors duration-300 font-body"
            placeholder="Enter mentor name"
          />
        </div>
        <div>
          <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">Email</label>
          <input
            type="email"
            value={mentor.email}
            onChange={(e) => onInputChange('mentor', 'email', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-heading focus:outline-none transition-colors duration-300 font-body"
            placeholder="Enter mentor email"
          />
        </div>
        <div>
          <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">Phone</label>
          <input
            type="tel"
            value={mentor.phone}
            onChange={(e) => onInputChange('mentor', 'phone', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-heading focus:outline-none transition-colors duration-300 font-body"
            placeholder="Enter mentor phone"
          />
        </div>
        <div>
          <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">Designation</label>
          <input
            type="text"
            value={mentor.designation}
            onChange={(e) => onInputChange('mentor', 'designation', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-heading focus:outline-none transition-colors duration-300 font-body"
            placeholder="Enter designation"
          />
        </div>
      </div>
    </motion.div>
  );
}
