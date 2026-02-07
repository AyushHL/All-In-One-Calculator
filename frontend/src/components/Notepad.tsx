import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, X, BookmarkPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const Notepad: React.FC = () => {
  const { notepad, setNotepad, saveNotepad, user } = useApp();
  const [saved, setSaved] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<number | null>(null);\n  const [showTitleModal, setShowTitleModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  useEffect(() => {
    // Auto-save after 2 seconds of no typing
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (user && notepad) {
      const timer = setTimeout(() => {
        saveNotepad().catch(err => console.error('Auto-save failed:', err));
      }, 2000);
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [notepad]);

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save notes!');
      return;
    }

    try {
      await saveNotepad();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const handleSaveToNotes = () => {
    if (!user) {
      setNotification({show: true, message: 'Please sign in to save notes!', type: 'error'});
      return;
    }

    if (!notepad.trim()) {
      setNotification({show: true, message: 'Notepad is empty!', type: 'error'});
      return;
    }

    setShowTitleModal(true);
  };

  const saveToSavedNotes = async () => {
    if (!noteTitle.trim()) {
      setNotification({show: true, message: 'Please enter a title!', type: 'error'});
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/notes', {
        title: noteTitle,
        content: notepad,
      }, {
        headers: { 'x-auth-token': token }
      });

      setNoteTitle('');
      setShowTitleModal(false);
      setNotepad('');
      setNotification({show: true, message: 'Note saved successfully!', type: 'success'});
    } catch (error) {
      console.error('Save error:', error);
      setNotification({show: true, message: 'Failed to save note to Saved Notes', type: 'error'});
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="h-full glass-morphism rounded-3xl p-6 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-300">
            📝 Notepad
          </h3>
          <div className="flex gap-2">
            {notepad && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSaveToNotes}
                  className="p-2 rounded-lg transition-all bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  title="Save to Saved Notes"
                >
                  <BookmarkPlus size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNotepad('')}
                  className="p-2 rounded-lg transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  title="Clear notepad"
                >
                  <X size={20} />
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className={`p-2 rounded-lg transition-all ${
                saved 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
              title="Auto-save to notepad"
            >
              {saved ? <Check size={20} /> : <Save size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={notepad}
          onChange={(e) => setNotepad(e.target.value)}
          className="flex-1 bg-transparent resize-none outline-none text-slate-200 leading-relaxed font-light placeholder-slate-500"
          placeholder={user ? "Type your notes here...\n\n• Quick calculations\n• Important formulas\n• Reminders\n\nAuto-saves as you type!" : "Sign in to use notepad..."}
          disabled={!user}
        />

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 text-center">
            {user 
              ? saved 
                ? '✓ Saved to database' 
                : 'Auto-saving...'
              : 'Sign in to save notes'
            }
          </p>
        </div>
      </motion.div>

      {/* Title Modal */}
      <AnimatePresence>
        {showTitleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTitleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Save Note</h3>
                <button
                  onClick={() => setShowTitleModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Give your note a title to save it to Saved Notes
              </p>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white mb-4 focus:outline-none focus:border-yellow-500/50"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && saveToSavedNotes()}
              />
              <div className="flex gap-3">
                <button
                  onClick={saveToSavedNotes}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
                <button
                  onClick={() => setShowTitleModal(false)}
                  className="px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setNotification({...notification, show: false})}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-slate-800 border ${
                notification.type === 'success' ? 'border-green-500/30' : 'border-red-500/30'
              } rounded-3xl p-6 max-w-md w-full`}
            >
              <div className={`text-center ${
                notification.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                <p className="text-lg font-semibold mb-4">{notification.message}</p>
                <button
                  onClick={() => setNotification({...notification, show: false})}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    notification.type === 'success' 
                      ? 'bg-green-500/20 hover:bg-green-500/30' 
                      : 'bg-red-500/20 hover:bg-red-500/30'
                  }`}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Notepad;
