'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder 
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">{label}</label>
      
      {/* Dropdown Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-left text-white focus:border-heading focus:outline-none transition-colors duration-300 font-body flex items-center justify-between"
        whileHover={{ borderColor: 'rgba(0, 113, 45, 0.3)' }}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
            style={{ zIndex: 100 }}
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-4 text-left hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700 last:border-b-0"
                whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <div className="font-medium text-white text-sm mb-1 tracking-wide">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-gray-400 text-xs leading-relaxed">
                    {option.description}
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
