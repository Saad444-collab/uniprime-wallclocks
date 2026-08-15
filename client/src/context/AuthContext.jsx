import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const res = await API.get('/auth/me');
        if (mounted) setUser(res.data.data);
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    restoreSession();

    const handleLogout = () => {
      if (mounted) setUser(null);
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => {
      mounted = false;
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, []);

  const register = async (data) => {
    const res = await API.post('/auth/register', data);
    const userData = res.data.data;
    setUser(userData);
    toast.success('Registration successful! Please check your email to verify.');
    return userData;
  };

  const login = async (data) => {
    try {
      const res = await API.post('/auth/login', data);
      const userData = res.data.data;
      setUser(userData);
      toast.success('Welcome back!');
      return userData;
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        return { needsVerification: true, email: err.response.data.email };
      }
      throw err;
    }
  };

  const logout = async () => {
    try { await API.post('/auth/logout'); } catch (e) { /* ignore */ }
    setUser(null);
    toast.success('Logged out');
  };

  const resendVerification = async (email) => {
    const res = await API.post('/auth/resend-verification', { email });
    toast.success(res.data.message || 'Verification email sent!');
    return res.data;
  };

  const getMe = async () => {
    const res = await API.get('/auth/me');
    const merged = { ...(user || {}), ...res.data.data };
    setUser(merged);
    return merged;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, getMe, resendVerification, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};