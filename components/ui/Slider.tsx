'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SliderOption {
  value: string;
  label: string;
}

interface SliderProps {
  options: SliderOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  showOtherInput?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}

export default function Slider({ 
  options, 
  value, 
  onChange, 
  label, 
  required = false,
  showOtherInput = false,
  otherValue = '',
  onOtherChange 
}: SliderProps) {
  const [isOtherSelected, setIsOtherSelected] = useState(value === 'Other');
  
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    if (optionValue === 'Other') {
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(false);
    }
  };

  const selectedIndex = options.findIndex(option => option.value === value);

  return (
    <div>
      <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">{label} {required && <span className="text-red-400">*</span>}</label>
      
      {/* Slider Container */}
      <div className="relative bg-gray-800/50 border border-gray-700 rounded-lg p-1">
        {/* Background track */}
        <div className="relative flex">
          {/* Sliding indicator */}
          {selectedIndex >= 0 && (
            <motion.div
              className="absolute top-0 h-full bg-heading/20 border border-heading/40 rounded-md"
              initial={false}
              animate={{
                left: `${(selectedIndex / options.length) * 100}%`,
                width: `${100 / options.length}%`
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          
          {/* Options */}
          {options.map((option, index) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`relative z-10 flex-1 py-2 px-2 text-center text-sm font-medium tracking-wide transition-colors duration-200 ${
                value === option.value 
                  ? 'text-heading' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Other input field */}
      {showOtherInput && isOtherSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3"
        >
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange?.(e.target.value)}
            placeholder="Please specify"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-heading focus:outline-none transition-colors duration-300 font-body"
          />
        </motion.div>
      )}
    </div>
  );
}
