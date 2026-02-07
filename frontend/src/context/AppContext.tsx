import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id?: string;
  email: string;
  notepad: string;
  username?: string;
  picture?: string;
}

interface HistoryEntry {
  _id: string;
  type: string;
  expression: string;
  result: string;
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  history: HistoryEntry[];
  setHistory: (history: HistoryEntry[]) => void;
  addHistory: (type: string, expression: string, result: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  notepad: string;
  setNotepad: (note: string) => void;
  saveNotepad: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notepad, setNotepad] = useState<string>('');

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      loadUserData();
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
      setNotepad(res.data.notepad || '');
      await fetchHistory();
    } catch (err) {
      console.error('Failed to load user data:', err);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setNotepad(userData.notepad || '');
      
      axios.defaults.headers.common['x-auth-token'] = newToken;
      await fetchHistory();
    } catch (err: any) {
      throw new Error(err.response?.data?.msg || 'Login failed');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/register', { email, password });
      const { token: newToken, user: userData } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setNotepad(userData.notepad || '');
      
      axios.defaults.headers.common['x-auth-token'] = newToken;
    } catch (err: any) {
      throw new Error(err.response?.data?.msg || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setHistory([]);
    setNotepad('');
    delete axios.defaults.headers.common['x-auth-token'];
  };

  const fetchHistory = async () => {
    if (!token) return;
    
    try {
      const res = await axios.get('/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const addHistory = async (type: string, expression: string, result: string) => {
    if (!token) return;
    
    try {
      const res = await axios.post('/api/history', { type, expression, result });
      setHistory([res.data, ...history]);
    } catch (err) {
      console.error('Failed to add history:', err);
    }
  };

  const clearHistory = async () => {
    if (!token) return;
    
    try {
      await axios.delete('/api/history');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const saveNotepad = async () => {
    if (!token) return;
    
    try {
      await axios.post('/api/notepad', { note: notepad });
    } catch (err) {
      console.error('Failed to save notepad:', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        login,
        register,
        logout,
        history,
        setHistory,
        addHistory,
        fetchHistory,
        clearHistory,
        notepad,
        setNotepad,
        saveNotepad,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
