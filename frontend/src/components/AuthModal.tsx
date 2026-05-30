import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User } from 'lucide-react';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';

interface AuthModalProps {
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot_password';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [view, setView] = useState<AuthView>('login');

  return (
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
        className="glass-morphism rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="overflow-y-auto p-8 w-full custom-scrollbar">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <User size={40} />
            </motion.div>
            <h2 className="text-3xl font-bold text-gradient mb-2">
              {view === 'forgot_password' ? 'Reset Password' : view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400">
              {view === 'forgot_password' ? 'Enter your email to receive an OTP' : view === 'login' ? 'Sign in to access your calculators' : 'Join to save your calculations'}
            </p>
          </div>

          {/* Render Active View */}
          {view === 'login' && (
            <LoginForm 
              onClose={onClose} 
              onSwitchToRegister={() => setView('register')} 
              onSwitchToForgotPassword={() => setView('forgot_password')} 
            />
          )}

          {view === 'register' && (
            <RegisterForm 
              onClose={onClose} 
              onSwitchToLogin={() => setView('login')} 
            />
          )}

          {view === 'forgot_password' && (
            <ForgotPasswordForm 
              onSwitchToLogin={() => setView('login')} 
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
