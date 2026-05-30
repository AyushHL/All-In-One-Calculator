import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useOAuth = (setNotification: (notif: { show: boolean, message: string, type: 'success' | 'error' }) => void) => {
  const { setUser, setToken } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const error = params.get('error');

    if (error) {
      setNotification({ show: true, message: 'Authentication Failed. Please try again.', type: 'error' });
      window.history.replaceState({}, '', '/');
      return;
    }

    if (token && email) {
      // Store Token
      localStorage.setItem('token', token);

      // Set a Flag to Prevent Infinite Reload
      const isReloading = sessionStorage.getItem('oauth_reload');

      if (!isReloading) {
        sessionStorage.setItem('oauth_reload', 'true');
        window.location.href = '/';
      } else {
        sessionStorage.removeItem('oauth_reload');
        setToken(token);

        // Fetch Full User Data from Backend
        fetch(`${API_URL}/api/auth/user`, {
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
            console.error('Failed to Fetch User Data:', err);
            setUser({ email: decodeURIComponent(email), notepad: '' });
          });
      }
    }
  }, [setUser, setToken, setNotification]);
};
