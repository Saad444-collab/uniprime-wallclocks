import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const passwordsMatch = !confirmPassword || form.password === confirmPassword;
  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = passwordStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      toast.error('You must accept the Terms & Conditions to continue');
      return;
    }
    if (form.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setRegisteredEmail(form.email);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const inputClass = `w-full border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'}`;

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <Seo title="Create Account" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-6 bg-gold rounded-full transform rotate-12"></div>
          </div>
          <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Join the UniPrime family</p>
        </div>

        {registeredEmail ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <FiCheck size={28} className="text-green-400" />
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Account created! We sent a verification code to <strong className="text-gold">{registeredEmail}</strong>.
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Check your inbox (and spam folder) for the 6-digit code.
            </p>
            <Link to="/verify-email" className="btn-gold inline-block text-sm">Verify Email Now</Link>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Link to="/login" className="text-gold hover:text-gold-light">Back to Login</Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-5">
            <div>
              <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`${inputClass} pl-12`} required autoComplete="name" />
              </div>
            </div>
            <div>
              <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`${inputClass} pl-12`} required autoComplete="email" />
              </div>
            </div>
            <div>
              <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone (Optional)</label>
              <div className="relative">
                <FiPhone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`${inputClass} pl-12`} autoComplete="tel" />
              </div>
            </div>
            <div>
              <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pl-12 pr-12`} minLength={6} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? 'bg-gold' : 'bg-gray-600'}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Confirm Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pl-12 pr-12 ${confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`} minLength={6} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 accent-[#D4A843]"
                required
              />
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                I have read and agree to the{' '}
                <Link to="/terms-and-conditions" className="text-gold hover:text-gold-light" target="_blank">Terms & Conditions</Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="text-gold hover:text-gold-light" target="_blank">Privacy Policy</Link>
              </span>
            </label>
            <button type="submit" disabled={loading || !accepted} className="btn-gold w-full text-sm py-3 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <div className={`text-center text-sm space-y-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <p>Already have an account? <Link to="/login" className="text-gold hover:text-gold-light">Sign In</Link></p>
              <p><Link to="/verify-email" className="text-gold hover:text-gold-light">Verify Email</Link></p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}