import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  theme?: 'indigo' | 'orange' | 'cyan' | 'default';
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  theme = 'indigo',
  placeholder = 'Select option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
      }, 50);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Theme styling helpers
  const getThemeStyles = () => {
    switch (theme) {
      case 'orange':
        return {
          focusBorder: 'focus:border-orange-500/50 border-orange-500/20',
          hoverBg: 'hover:bg-orange-500/10',
          selectedBg: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-200',
          iconColor: 'text-orange-400',
          openBorder: 'border-orange-500/50 shadow-orange-500/5',
        };
      case 'cyan':
        return {
          focusBorder: 'focus:border-cyan-500/50 border-cyan-500/20',
          hoverBg: 'hover:bg-cyan-500/10',
          selectedBg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-200',
          iconColor: 'text-cyan-400',
          openBorder: 'border-cyan-500/50 shadow-cyan-500/5',
        };
      case 'indigo':
      default:
        return {
          focusBorder: 'focus:border-indigo-500/50 border-indigo-500/20',
          hoverBg: 'hover:bg-indigo-500/10',
          selectedBg: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-200',
          iconColor: 'text-indigo-400',
          openBorder: 'border-indigo-500/50 shadow-indigo-500/5',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div ref={containerRef} className="relative select-none w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between text-left`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`${styles.iconColor} shrink-0 ml-2`}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      {/* Options List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 mt-2 max-h-60 flex flex-col overflow-hidden bg-slate-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl z-50"
          >
            <div className="overflow-y-auto p-1.5 w-full custom-scrollbar">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No options available</div>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <motion.div
                      key={option.value}
                      ref={isSelected ? selectedItemRef : null}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      whileHover={{ x: 2 }}
                      className={`flex items-center justify-between px-4 py-2.5 my-0.5 rounded-xl cursor-pointer text-sm font-medium transition-all duration-150 ${
                        isSelected
                          ? styles.selectedBg
                          : `text-slate-300 hover:text-white ${styles.hoverBg}`
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`${styles.iconColor} shrink-0 ml-2`}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
