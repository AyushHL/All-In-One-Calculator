import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  max?: string;
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, max, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // formatting value for display: YYYY-MM-DD to DD-MM-YYYY
  const [inputValue, setInputValue] = useState(value ? value.split('-').reverse().join('-') : '');
  
  // Parse initial date
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    setInputValue(value ? value.split('-').reverse().join('-') : '');
    if (value) {
      const d = new Date(value);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (max && dateString > max) return;
    
    onChange(dateString);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Strip non-digit and non-dash characters
    const digitsOnly = val.replace(/[^0-9]/g, '');
    
    // Auto-format: insert dashes after DD and MM
    let formatted = '';
    for (let i = 0; i < digitsOnly.length && i < 8; i++) {
      if (i === 2 || i === 4) formatted += '-';
      formatted += digitsOnly[i];
    }
    
    setInputValue(formatted);

    // Parse DD-MM-YYYY
    const parts = formatted.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const y = parseInt(parts[2]);
      
      if (!isNaN(d) && !isNaN(m) && !isNaN(y) && d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000) {
        const dateString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!max || dateString <= max) {
          onChange(dateString);
          setCurrentMonth(m - 1);
          setCurrentYear(y);
        }
      }
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const yearOptions = Array.from({ length: 120 }).map((_, i) => new Date().getFullYear() - 100 + i);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`${className} flex items-center justify-between text-left overflow-hidden h-[54px]`}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="DD-MM-YYYY"
          className="bg-transparent border-none focus:outline-none w-full text-white placeholder-slate-500 font-medium tracking-wide uppercase p-0 m-0"
        />
        <CalendarIcon 
          size={20} 
          className="text-indigo-400 shrink-0 ml-2 cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 p-5 bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-black/80"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 transition-colors">
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex gap-2">
                <CustomSelect
                  value={String(currentMonth)}
                  onChange={(v) => setCurrentMonth(parseInt(v))}
                  options={monthNames.map((m, i) => ({ value: String(i), label: m }))}
                  className="bg-slate-800 text-indigo-300 font-bold border border-white/10 rounded-lg px-3 py-1.5 hover:bg-slate-700 cursor-pointer text-sm w-28"
                  theme="indigo"
                />
                
                <CustomSelect
                  value={String(currentYear)}
                  onChange={(v) => setCurrentYear(parseInt(v))}
                  options={yearOptions.map(y => ({ value: String(y), label: String(y) }))}
                  className="bg-slate-800 text-indigo-300 font-bold border border-white/10 rounded-lg px-3 py-1.5 hover:bg-slate-700 cursor-pointer text-sm w-24"
                  theme="indigo"
                />
              </div>

              <button type="button" onClick={handleNextMonth} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-3 border-b border-white/10 pb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-indigo-300/70">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = value === dateString;
                
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                const isToday = todayString === dateString;
                const isDisabled = max ? dateString > max : false;

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(day)}
                    className={`
                      w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm transition-all duration-200
                      ${isSelected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/40 scale-110' : 'text-slate-200'}
                      ${!isSelected && !isDisabled ? 'hover:bg-white/10 hover:text-white' : ''}
                      ${isToday && !isSelected ? 'border border-indigo-500/50 text-indigo-400 font-semibold bg-indigo-500/10' : ''}
                      ${isDisabled ? 'opacity-20 cursor-not-allowed' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
