import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import PageMeta from './components/PageMeta';
import { useApp } from './context/AppContext';
import { useOAuth } from './hooks/useOAuth';


function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'error'});
  const { user, logout } = useApp();

  // Use Custom Hook for OAuth
  useOAuth(setNotification);

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
      <Sidebar onSupportClick={() => setShowSupport(true)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Calculator Area */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold text-gradient pl-10 md:pl-0"
            >
              All-in-One Calculator
            </motion.h1>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => user ? setShowUserMenu(!showUserMenu) : setShowAuth(true)}
                className="flex items-center gap-2 md:gap-3 p-2 md:pl-2.5 md:pr-4 glass-morphism rounded-full hover:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {user?.picture ? (
                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
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

          {/* Calculator Content — URL-based routing */}
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={
                <>
                  <PageMeta 
                    title="All-in-One Calculator Hub — Basic Calculator" 
                    description="Free online basic calculator with a modern interface. Perform addition, subtraction, multiplication, division and more." 
                  />
                  <BasicCalculator />
                </>
              } />
              <Route path="/scientific-calculator" element={
                <>
                  <PageMeta 
                    title="Scientific Calculator — All-in-One Calculator Hub" 
                    description="Free online scientific calculator with trigonometric, logarithmic, exponential functions and more. Perfect for students and professionals." 
                  />
                  <Scientific />
                </>
              } />
              <Route path="/age-calculator" element={
                <>
                  <PageMeta 
                    title="Age Calculator — All-in-One Calculator Hub" 
                    description="Calculate your exact age in years, months, and days. Find the time between two dates with our free online age calculator." 
                  />
                  <AgeCalculator />
                </>
              } />
              <Route path="/bmi-calculator" element={
                <>
                  <PageMeta 
                    title="BMI Calculator — All-in-One Calculator Hub" 
                    description="Calculate your Body Mass Index (BMI) instantly. Check if you're underweight, normal, overweight, or obese with our free BMI calculator." 
                  />
                  <BMICalculator />
                </>
              } />
              <Route path="/unit-converter" element={
                <>
                  <PageMeta 
                    title="Unit Converter — All-in-One Calculator Hub" 
                    description="Convert between units of length, weight, temperature, volume, and more. Free online unit conversion tool." 
                  />
                  <Converter />
                </>
              } />
              <Route path="/number-system-converter" element={
                <>
                  <PageMeta 
                    title="Number System Converter — All-in-One Calculator Hub" 
                    description="Convert between binary, decimal, octal, and hexadecimal number systems. Free online number base converter." 
                  />
                  <NumberSystemConverter />
                </>
              } />
              <Route path="/saved-notes" element={
                <>
                  <PageMeta 
                    title="Saved Notes — All-in-One Calculator Hub" 
                    description="View and manage your saved calculation notes. Keep track of important results and formulas." 
                  />
                  <SavedNotes />
                </>
              } />
              <Route path="/history" element={
                <>
                  <PageMeta 
                    title="History — All-in-One Calculator Hub" 
                    description="View your calculation history. Review past calculations and results across all calculator tools." 
                  />
                  <History />
                </>
              } />
              {/* Fallback — redirect unknown routes to home */}
              <Route path="*" element={
                <>
                  <PageMeta 
                    title="All-in-One Calculator Hub — Basic Calculator" 
                    description="Free online basic calculator with a modern interface. Perform addition, subtraction, multiplication, division and more." 
                  />
                  <BasicCalculator />
                </>
              } />
            </Routes>
          </div>
        </div>

        {/* Notepad Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-white/10 p-4 overflow-hidden">
          <Notepad />
        </div>
      </main>


      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
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
