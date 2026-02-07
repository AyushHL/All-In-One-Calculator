import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Image, Check, AlertCircle, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, setUser } = useApp();
  const [username, setUsername] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false, message: '', type: 'success'
  });

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      if (user.picture) {
        setPreviewUrl(`http://localhost:5000${user.picture}`);
      }
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          show: true,
          message: 'Image size must be less than 5MB',
          type: 'error'
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setNotification({
          show: true,
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed',
          type: 'error'
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = async () => {
    setLoading(true);
    setNotification({ show: false, message: '', type: 'success' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        'http://localhost:5000/api/auth/profile/picture',
        {
          headers: { 'x-auth-token': token }
        }
      );

      setUser(response.data.user);
      setPreviewUrl('');
      setSelectedFile(null);
      setNotification({
        show: true,
        message: 'Profile picture removed successfully!',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 2000);
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.response?.data?.msg || 'Failed to remove picture',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setNotification({ show: false, message: '', type: 'success' });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (username.trim()) {
        formData.append('username', username.trim());
      }
      
      if (selectedFile) {
        formData.append('picture', selectedFile);
      }

      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUser(response.data.user);
      setNotification({
        show: true,
        message: 'Profile updated successfully!',
        type: 'success'
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.response?.data?.msg || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="glass-morphism rounded-3xl w-full max-w-md p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-gradient mb-2">
              Edit Profile
            </h2>
            <p className="text-slate-400">
              Customize your account details
            </p>
          </div>

          {/* Notification */}
          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
                  notification.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field w-full opacity-60 cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="Enter your username"
                  maxLength={30}
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Profile Picture
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="picture-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="picture-upload"
                  className="flex items-center gap-3 p-4 glass-morphism rounded-xl cursor-pointer hover:bg-white/10 transition-all border-2 border-dashed border-white/20 hover:border-blue-500/50"
                >
                  <Upload className="text-slate-400" size={24} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPEG, PNG, GIF, or WebP (max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-slate-400">Preview:</p>
                  <button
                    onClick={handleRemovePicture}
                    disabled={loading}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    Remove Picture
                  </button>
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-white/20">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;
