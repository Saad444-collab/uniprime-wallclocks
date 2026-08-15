import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { FiLock, FiKey, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function ResetPassword() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';
  const [form, setForm] = useState({ token: urlToken, otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (urlToken) setForm((f) => ({ ...f, token: urlToken }));
  }, [urlToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const payload = { newPassword: form.newPassword };
    if (form.token) {
      payload.token = form.token;
    } else if (form.otp) {
      payload.otp = form.otp.trim();
    } else {
      toast.error('Enter the reset code or token');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/reset-password', payload);
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  const inputClass = `w-full border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'}`;

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <Seo title="Reset Password" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-6 bg-gold rounded-full transform rotate-12"></div>
          </div>
          <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Set New Password</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            {urlToken ? 'Enter your new password to continue' : 'Enter the 6-digit code and your new password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-5">
          {urlToken ? (
            <p className="text-xs text-green-400 flex items-center gap-2">
              <FiKey size={13} /> Reset link detected - password is ready to change.
            </p>
          ) : (
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Reset Code (OTP)</label>
              <div className="relative">
                <FiKey size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} placeholder="6-digit code"
                  className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-sm tracking-[0.4em] focus:outline-none focus:border-gold`} />
              </div>
              <p className="mt-1 text-[10px] text-gray-500">No code? Check your inbox or use the reset link from the email.</p>
            </div>
          )}
          <div>
            <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>New Password</label>
            <div className="relative">
              <FiLock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className={`${inputClass} pl-12`} minLength={6} required autoComplete="new-password" />
            </div>
          </div>
          <div>
            <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Confirm Password</label>
            <div className="relative">
              <FiLock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`${inputClass} pl-12 ${form.confirmPassword && form.newPassword !== form.confirmPassword ? 'border-red-500' : ''}`} minLength={6} required autoComplete="new-password" />
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full text-sm py-3 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <Link to="/login" className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold transition-colors`}>
            <FiArrowLeft size={14} /> Back to Login
          </Link>
        </form>
      </motion.div>
    </div>
  );
}