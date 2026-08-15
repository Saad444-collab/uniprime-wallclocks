import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(null);
  const [resending, setResending] = useState(false);
  const { login, resendVerification } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(null);
    try {
      const result = await login(form);
      if (result?.needsVerification) {
        setNeedsVerification({ email: result.email });
        toast.error('Please verify your email before logging in');
        return;
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!needsVerification?.email) return;
    setResending(true);
    try {
      await resendVerification(needsVerification.email);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const inputClass = `w-full border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'}`;

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <Seo title="Login" description="Sign in to your UniPrime Wall Clocks account to manage orders, track shipments, and shop faster." noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-6 bg-gold rounded-full transform rotate-12"></div>
          </div>
          <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Sign in to your account</p>
        </div>

        {needsVerification && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            <div className="flex items-start gap-3">
              <FiAlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <div className={`${isDark ? 'text-amber-200' : 'text-amber-700'} space-y-2`}>
                <p className="font-medium">Your email has not been verified yet.</p>
                <p className="text-xs opacity-80">Check your inbox for the verification code, or request a new one.</p>
                <button type="button" onClick={handleResend} disabled={resending}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50">
                  <FiSend size={13} /> {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="glass-card space-y-5">
          <div>
            <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</label>
            <div className="relative">
              <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`${inputClass} pl-12`} required autoComplete="email" />
            </div>
          </div>
          <div>
            <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass} pl-12 pr-12`} required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#D4A843]"
              />
              <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Remember me</span>
            </label>
            <Link to="/forgot-password" className={`text-xs hover:text-gold transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full text-sm py-3 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className={`text-center text-sm space-y-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>Don't have an account? <Link to="/register" className="text-gold hover:text-gold-light">Register</Link></p>
            <p><Link to="/verify-email" className="text-gold hover:text-gold-light">Verify Email</Link></p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}