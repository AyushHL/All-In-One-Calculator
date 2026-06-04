import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Calculator, 
  Calendar, 
  Activity, 
  History as HistoryIcon, 
  ChevronRight,
  Hash,
  StickyNote,
  Headphones
} from 'lucide-react';

interface SidebarProps {
  onSupportClick: () => void;
}

const menuItems = [
  { id: 'basic', path: '/', label: 'Basic Calculator', icon: Calculator, color: 'from-slate-500 to-gray-600' },
  { id: 'scientific', path: '/scientific-calculator', label: 'Scientific', icon: Calculator, color: 'from-blue-500 to-cyan-500' },
  { id: 'age', path: '/age-calculator', label: 'Age Calculator', icon: Calendar, color: 'from-purple-500 to-pink-500' },
  { id: 'bmi', path: '/bmi-calculator', label: 'BMI Calculator', icon: Activity, color: 'from-green-500 to-emerald-500' },
  { id: 'converter', path: '/unit-converter', label: 'Converter', icon: ChevronRight, color: 'from-orange-500 to-red-500' },
  { id: 'numbersystem', path: '/number-system-converter', label: 'Number System', icon: Hash, color: 'from-indigo-500 to-purple-500' },
  { id: 'savednotes', path: '/saved-notes', label: 'Saved Notes', icon: StickyNote, color: 'from-yellow-500 to-amber-500' },
  { id: 'history', path: '/history', label: 'History', icon: HistoryIcon, color: 'from-rose-500 to-pink-500' },
];

const Sidebar: React.FC<SidebarProps> = ({ onSupportClick }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isOpen, setIsOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const iconSize = isMobile ? 20 : 16;

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isMobile ? (isOpen ? 0 : -280) : 0,
          width: isMobile ? 280 : (isOpen ? 280 : 80) 
        }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200,
          duration: 0.3
        }}
        className={`
          h-screen border-r border-white/10 p-4 flex flex-col 
          ${isMobile ? 'fixed left-0 top-0 z-50 bg-slate-900/95 shadow-2xl' : 'relative bg-slate-900/50'} 
          backdrop-blur-xl transition-[background-color] duration-300
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            absolute top-[22px] md:top-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2.5 md:p-2 border-2 border-slate-900 
            hover:scale-110 active:scale-95 transition-transform z-50 shadow-lg
            ${isMobile ? (isOpen ? '-right-5' : '-right-12') : '-right-3'}
          `}
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X size={iconSize} /> : <Menu size={iconSize} />}
          </motion.div>
        </button>

        {/* Logo/Title */}
        <div className="mb-10 mt-4 text-center sm:text-left overflow-hidden">
          <motion.div
            animate={{ 
              justifyContent: isOpen ? 'flex-start' : 'center' 
            }}
            className="flex items-center gap-3"
          >
            <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 ${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
              <Calculator size={24} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold text-gradient whitespace-nowrap"
                >
                  Calculator Hub
                </motion.h1>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.id} to={item.path} onClick={handleTabClick}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} shadow-lg` 
                      : 'hover:bg-white/5'
                    }
                    ${!isOpen && !isMobile ? 'justify-center' : ''}
                  `}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon size={22} className="flex-shrink-0" />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-auto pt-4 border-t border-white/10"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSupportClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg whitespace-nowrap"
              >
                <Headphones size={20} />
                <span className="font-medium">Support</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
};

export default Sidebar;
