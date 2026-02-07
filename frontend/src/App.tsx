import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BasicCalculator from './components/BasicCalculator';
import Scientific from './components/Scientific';
import BMICalculator from './components/BMICalculator';
import AgeCalculator from './components/AgeCalculator';
import Converter from './components/Converter';
import NumberSystemConverter from './components/NumberSystemConverter';
import SavedNotes from './components/SavedNotes';
import History from './components/History';
import Notepad from './components/Notepad';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import SupportModal from './components/SupportModal';
import { useApp } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'basic';
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { user, logout, setUser, setToken } = useApp();

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const error = params.get('error');

    if (error) {
      alert('Authentication failed. Please try again.');
      window.history.replaceState({}, '', '/');
      return;
    }

    if (token && email) {
      // Store token
      localStorage.setItem('token', token);
      
      // Set a flag to prevent infinite reload
      const isReloading = sessionStorage.getItem('oauth_reload');
      
      if (!isReloading) {
        sessionStorage.setItem('oauth_reload', 'true');
        window.location.href = '/';
      } else {
        sessionStorage.removeItem('oauth_reload');
        setToken(token);
        
        // Fetch full user data from backend
        fetch('http://localhost:5000/api/auth/user', {
          headers: { 'x-auth-token': token }
        })
          .then(res => res.json())
          .then(userData => {
            setUser({
              email: userData.email,
              notepad: userData.notepad || ''
            });
          })
          .catch(err => {
            console.error('Failed to fetch user data:', err);
            setUser({ email: decodeURIComponent(email), notepad: '' });
          });
      }
    }
  }, [setUser, setToken]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicCalculator />;
      case 'scientific':
        return <Scientific />;
      case 'bmi':
        return <BMICalculator />;
      case 'age':
        return <AgeCalculator />;
      case 'converter':
        return <Converter />;
      case 'numbersystem':
        return <NumberSystemConverter />;
      case 'savednotes':
        return <SavedNotes />;
      case 'history':
        return <History />;
      default:
        return <BasicCalculator />;
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setShowUserMenu(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSupportClick={() => setShowSupport(true)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Calculator Area */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold text-gradient"
            >
              All-in-One Calculator Hub
            </motion.h1>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => user ? setShowUserMenu(!showUserMenu) : setShowAuth(true)}
                className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-full hover:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.picture ? (
                    <img src={`http://localhost:5000${user.picture}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user ? (user.username || user.email.split('@')[0]) : 'Login / Sign Up'}
                </span>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 glass-morphism rounded-xl p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-all mb-1"
                    >
                      <Settings size={16} />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-red-400 transition-all"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* Calculator Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Notepad Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-white/10 p-4 overflow-hidden">
          <Notepad />
        </div>
      </main>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}

      {/* Support Modal */}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}

export default App;
