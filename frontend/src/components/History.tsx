import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Calculator, Calendar, Activity, ArrowRightLeft, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';

const History: React.FC = () => {
  const { history, clearHistory, user } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'Basic':
        return <Calculator size={20} className="text-slate-400" />;
      case 'Scientific':
        return <Calculator size={20} className="text-blue-400" />;
      case 'BMI':
        return <Activity size={20} className="text-green-400" />;
      case 'Age':
        return <Calendar size={20} className="text-purple-400" />;
      case 'Converter':
        return <ArrowRightLeft size={20} className="text-orange-400" />;
      case 'Number System':
        return <Hash size={20} className="text-indigo-400" />;
      default:
        return <Calculator size={20} className="text-slate-400" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Basic':
        return 'from-slate-500/10 to-gray-600/10 border-slate-500/20';
      case 'Scientific':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
      case 'BMI':
        return 'from-green-500/10 to-emerald-500/10 border-green-500/20';
      case 'Age':
        return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
      case 'Converter':
        return 'from-orange-500/10 to-red-500/10 border-orange-500/20';
      case 'Number System':
        return 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20';
      default:
        return 'from-slate-500/10 to-slate-600/10 border-slate-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
            <Clock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-3">History Unavailable</h2>
          <p className="text-slate-400 mb-6">Sign in to view your calculation history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
              Calculation History
            </h2>
            <p className="text-slate-400">
              {history.length} {history.length === 1 ? 'calculation' : 'calculations'} saved
            </p>
          </div>
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all"
            >
              <Trash2 size={18} />
              Clear All
            </motion.button>
          )}
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
              <Clock size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No History Yet</h3>
            <p className="text-slate-400">Start calculating to see your history here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence>
              {history.map((entry, index) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${getColor(entry.type)} border backdrop-blur-sm hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white/5 rounded-lg flex-shrink-0">
                        {getIcon(entry.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white">{entry.type}</h4>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">{formatDate(entry.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-1 break-all">{entry.expression}</p>
                        <p className="text-lg font-bold text-white">= {entry.result}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;
