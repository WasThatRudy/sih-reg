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
  required?: boolean;
}

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder,
  required = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <style jsx>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .dropdown-scroll::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 3px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 3px;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
      <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">{label} {required && <span className="text-red-400">*</span>}</label>
      
      {/* Dropdown Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-left text-white focus:border-heading focus:outline-none transition-colors duration-300 font-body flex items-center justify-between"
        whileHover={{ borderColor: 'rgba(0, 113, 45, 0.3)' }}
      >
        <div className="flex flex-col">
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption && selectedOption.description && (
            <span className="text-xs text-gray-500 mt-1">
              {selectedOption.description.split(' | ')[0]}
            </span>
          )}
        </div>
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
            className="absolute z-[9999] w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto dropdown-scroll"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}
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
                    {option.description.split(' | ').map((part, index) => {
                      const isSlotsInfo = part.startsWith('Available slots:');
                      let slotsClassName = '';
                      
                      if (isSlotsInfo) {
                        const slotsMatch = part.match(/(\d+)\/(\d+)/);
                        if (slotsMatch) {
                          const available = parseInt(slotsMatch[1]);
                          const max = parseInt(slotsMatch[2]);
                          if (available === 0) {
                            slotsClassName = 'text-red-400 font-bold';
                          } else if (available <= max * 0.2) {
                            slotsClassName = 'text-yellow-400 font-semibold';
                          } else {
                            slotsClassName = 'text-green-400 font-medium';
                          }
                        }
                      }
                      
                      return (
                        <span key={index} className={isSlotsInfo ? slotsClassName : ''}>
                          {part}
                          {index < option.description.split(' | ').length - 1 && (
                            <span className="text-gray-500 mx-1">•</span>
                          )}
                        </span>
                      );
                    })}
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
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
