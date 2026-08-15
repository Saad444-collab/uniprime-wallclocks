import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('If the email exists, a reset link has been sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <Seo title="Forgot Password" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-6 bg-gold rounded-full transform rotate-12"></div>
          </div>
          <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reset Password</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Enter your email to receive a reset token</p>
        </div>

        {sent ? (
          <div className="glass-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <FiMail size={28} className="text-green-400" />
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Check your email for the password reset link and 6-digit code.</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Use the link (or code) on the reset password page.</p>
            <Link to="/reset-password" className="btn-gold inline-block text-sm mt-2">Go to Reset</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-5">
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Email</label>
              <div className="relative">
                <FiMail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full text-sm py-3 disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Token'}
            </button>
            <Link to="/login" className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold transition-colors`}>
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
