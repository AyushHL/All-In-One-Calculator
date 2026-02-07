import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Calculator, 
  Calendar, 
  Activity, 
  BookText, 
  History as HistoryIcon, 
  ChevronRight,
  Hash,
  StickyNote,
  Headphones
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSupportClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSupportClick }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'basic', label: 'Basic Calculator', icon: Calculator, color: 'from-slate-500 to-gray-600' },
    { id: 'scientific', label: 'Scientific', icon: Calculator, color: 'from-blue-500 to-cyan-500' },
    { id: 'age', label: 'Age Calculator', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { id: 'bmi', label: 'BMI Calculator', icon: Activity, color: 'from-green-500 to-emerald-500' },
    { id: 'converter', label: 'Converter', icon: ChevronRight, color: 'from-orange-500 to-red-500' },
    { id: 'numbersystem', label: 'Number System', icon: Hash, color: 'from-indigo-500 to-purple-500' },
    { id: 'savednotes', label: 'Saved Notes', icon: StickyNote, color: 'from-yellow-500 to-amber-500' },
    { id: 'history', label: 'History', icon: HistoryIcon, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ 
        x: 0,
        width: isOpen ? 280 : 80 
      }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col relative"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2 border-2 border-slate-900 hover:scale-110 transition-transform z-10"
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </motion.div>
      </button>

      {/* Logo/Title */}
      <div className="mb-10 mt-4">
        <motion.div
          animate={{ 
            justifyContent: isOpen ? 'flex-start' : 'center' 
          }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calculator size={24} />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold text-gradient"
              >
                Calculator Hub
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? `bg-gradient-to-r ${item.color} shadow-lg` 
                  : 'hover:bg-white/5'
                }
              `}
            >
              <Icon size={22} className="flex-shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto pt-4 border-t border-white/10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSupportClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <Headphones size={20} />
            <span className="font-medium">Support</span>
          </motion.button>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
