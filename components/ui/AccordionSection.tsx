'use client';
import { motion } from 'framer-motion';

interface AccordionSectionProps {
  stepNumber: number;
  title: string;
  isComplete: boolean;
  isUnlocked: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  allowOverflow?: boolean;
}

export default function AccordionSection({
  stepNumber,
  title,
  isComplete,
  isUnlocked,
  isOpen,
  onToggle,
  children,
  allowOverflow = false
}: AccordionSectionProps) {

  const getStepIndicatorStyle = () => {
    if (isComplete) {
      return 'bg-heading text-white';
    }
    if (isUnlocked) {
      return 'bg-subheading/20 border border-subheading text-subheading';
    }
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <div className={`bg-gray-900/30 border border-gray-800 rounded-2xl ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'}`}>
      {/* Header */}
      <motion.div 
        className={`flex items-center justify-between p-6 border-b border-gray-800 transition-colors duration-200 ${
          isUnlocked ? 'cursor-pointer hover:bg-gray-800/30' : 'cursor-not-allowed'
        }`}
        onClick={() => isUnlocked && onToggle()}
        whileHover={isUnlocked ? { backgroundColor: 'rgba(55, 65, 81, 0.3)' } : {}}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepIndicatorStyle()}`}>
            {isComplete ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : stepNumber}
          </div>
          <h3 className={`font-display text-xl font-light tracking-wide ${
            isUnlocked ? 'text-white' : 'text-gray-500'
          }`}>{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {isUnlocked && (
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
          )}
        </div>
      </motion.div>
      
      {/* Content */}
      <motion.div
        initial={false}
        animate={{ height: isOpen && isUnlocked ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={allowOverflow && isOpen ? "overflow-visible" : "overflow-hidden"}
      >
        {isUnlocked && (
          <div className="p-6">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}
