import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookText, Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const SavedNotes: React.FC = () => {
  const { user } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, noteId: string | null}>({show: false, noteId: null});

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notes', {
        headers: { 'x-auth-token': token }
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Refetch notes every time component is mounted/visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && document.visibilityState === 'visible') {
        fetchNotes();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleCreateNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      setNotification({show: true, message: 'Please enter both title and content!', type: 'error'});
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notes', {
        title: newTitle,
        content: newContent,
      }, {
        headers: { 'x-auth-token': token }
      });
      setNewTitle('');
      setNewContent('');
      setShowNewNote(false);
      await fetchNotes();
      setNotification({show: true, message: 'Note created successfully!', type: 'success'});
    } catch (error) {
      setNotification({show: true, message: 'Failed to create note', type: 'error'});
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notes/${id}`, { title, content }, {
        headers: { 'x-auth-token': token }
      });
      setEditingId(null);
      await fetchNotes();
      setNotification({show: true, message: 'Note updated successfully!', type: 'success'});
    } catch (error) {
      setNotification({show: true, message: 'Failed to update note', type: 'error'});
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id: string) => {
    setDeleteConfirm({show: true, noteId: id});
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm.noteId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notes/${deleteConfirm.noteId}`, {
        headers: { 'x-auth-token': token }
      });
      await fetchNotes();
      setDeleteConfirm({show: false, noteId: null});
      setNotification({show: true, message: 'Note deleted successfully!', type: 'success'});
    } catch (error) {
      setNotification({show: true, message: 'Failed to delete note', type: 'error'});
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 glass-morphism rounded-3xl max-w-md"
        >
          <BookText size={64} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-2">Saved Notes</h2>
          <p className="text-slate-400">
            Sign in to create and manage your notes
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl">
            <BookText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Saved Notes</h2>
            <p className="text-sm text-slate-400">{notes.length} notes saved</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowNewNote(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          New Note
        </motion.button>
      </motion.div>

      {/* New Note Modal */}
      <AnimatePresence>
        {showNewNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewNote(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-6 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Create New Note</h3>
                <button
                  onClick={() => setShowNewNote(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white mb-4 focus:outline-none focus:border-yellow-500/50"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Note Content"
                rows={8}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-yellow-500/50"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreateNote}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-semibold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Note'}
                </button>
                <button
                  onClick={() => setShowNewNote(false)}
                  className="px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <AnimatePresence>
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12 glass-morphism rounded-3xl"
            >
              <BookText size={48} className="mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400">No notes yet. Create your first note!</p>
            </motion.div>
          ) : (
            notes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="glass-morphism rounded-2xl p-5 border border-white/10"
              >
                {editingId === note._id ? (
                  <div>
                    <input
                      type="text"
                      defaultValue={note.title}
                      id={`edit-title-${note._id}`}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white mb-3 focus:outline-none focus:border-yellow-500/50"
                    />
                    <textarea
                      defaultValue={note.content}
                      id={`edit-content-${note._id}`}
                      rows={6}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-yellow-500/50"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          const title = (document.getElementById(`edit-title-${note._id}`) as HTMLInputElement).value;
                          const content = (document.getElementById(`edit-content-${note._id}`) as HTMLTextAreaElement).value;
                          handleUpdateNote(note._id, title, content);
                        }}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all flex items-center gap-2"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white">{note.title}</h3>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => setEditingId(note._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          onClick={() => showDeleteConfirm(note._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap mb-3">{note.content}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      {formatDate(note.updatedAt)}
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm({show: false, noteId: null})}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-red-500/30 rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Delete Note</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteNote}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm({show: false, noteId: null})}
                  className="flex-1 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedNotes;
