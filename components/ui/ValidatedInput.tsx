'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getValidationMessage } from '@/lib/utils/validation';

interface ValidatedInputProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  validationType?: 'email' | 'phone' | 'name' | 'team name' | 'branch';
  className?: string;
  error?: string;
}

export default function ValidatedInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  validationType,
  className = '',
  error
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateField = (val: string) => {
    if (!validationType) return '';
    return getValidationMessage(validationType, val);
  };

  useEffect(() => {
    if (touched) {
      const newError = validateField(value);
      setValidationError(newError);
    }
  }, [value, touched, validationType]);

  const handleBlur = () => {
    setTouched(true);
    const newError = validateField(value);
    setValidationError(newError);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Special formatting for phone numbers
    if (validationType === 'phone') {
      // Remove non-digits
      newValue = newValue.replace(/\D/g, '');
      // Limit to 10 digits
      if (newValue.length > 10) {
        newValue = newValue.slice(0, 10);
      }
    }
    
    onChange(newValue);
  };

  const currentError = error || validationError;
  const hasError = touched && currentError;
  const isValid = touched && !currentError && value.trim().length > 0;

  return (
    <div className={className}>
      <label className="block text-subheading text-sm font-medium mb-2 tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors duration-300 font-body ${
            hasError 
              ? 'border-red-500 focus:border-red-400' 
              : isValid 
                ? 'border-green-500 focus:border-green-400'
                : 'border-gray-700 focus:border-heading'
          }`}
          placeholder={placeholder}
          required={required}
        />
        
        {/* Validation icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {hasError && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </motion.svg>
          )}
          {isValid && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
          )}
        </div>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-400 font-body"
          >
            {currentError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
