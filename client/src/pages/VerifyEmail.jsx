import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { FiMail, FiCheck, FiAlertCircle, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function VerifyEmail() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';
  const urlEmail = searchParams.get('email') || '';
  const [token, setToken] = useState(urlToken);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState(urlEmail);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const ranRef = useRef(null);

  useEffect(() => {
    setToken(urlToken);
    if (urlToken && ranRef.current !== urlToken) {
      ranRef.current = urlToken;
      setError('');
      setVerified(false);
      setLoading(true);
      API.post('/auth/verify-email', { token: urlToken })
        .then(() => { setVerified(true); toast.success('Email verified!'); })
        .catch((err) => { setError(err.response?.data?.message || 'Verification failed'); toast.error(err.response?.data?.message || 'Verification failed'); })
        .finally(() => setLoading(false));
    }
  }, [urlToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = otp ? { otp: otp.trim() } : { token: token.trim() };
      if (!payload.otp && !payload.token) {
        setError('Please enter your verification code');
        setLoading(false);
        return;
      }
      await API.post('/auth/verify-email', payload);
      setVerified(true);
      toast.success('Email verified successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      toast.error(err.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email to resend the verification code');
      return;
    }
    setResending(true);
    try {
      const res = await API.post('/auth/resend-verification', { email });
      toast.success(res.data.message || 'A new verification email has been sent');
      setError('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    }
    setResending(false);
  };

  const inputClass = `w-full border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'}`;

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <Seo title="Verify Email" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-6 bg-gold rounded-full transform rotate-12"></div>
          </div>
          <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Verify Email</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Enter the 6-digit code sent to your email</p>
        </div>

        {loading && urlToken ? (
          <div className="glass-card text-center space-y-4">
            <div className="clock-loader mx-auto"></div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Verifying your email...</p>
          </div>
        ) : verified ? (
          <div className="glass-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <FiCheck size={28} className="text-green-400" />
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Your email has been verified!</p>
            <Link to="/login" className="btn-gold inline-block text-sm">Go to Login</Link>
          </div>
        ) : error && urlToken && !otp ? (
          <div className="glass-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <FiAlertCircle size={28} className="text-red-400" />
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            <Link to="/verify-email" className="btn-gold inline-block text-sm">Try Again</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-5">
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Verification Code (OTP)</label>
              <div className="relative">
                <FiMail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code"
                  className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-sm tracking-[0.4em] focus:outline-none focus:border-gold`} />
              </div>
            </div>
            <div>
              <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Account Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass} placeholder="you@example.com" />
            </div>
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-2"><FiAlertCircle /> {error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full text-sm py-3 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button type="button" onClick={handleResend} disabled={resending || !email}
              className="w-full text-xs py-2 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 disabled:opacity-50 inline-flex items-center justify-center gap-2">
              <FiSend size={13} /> {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Link to="/login" className="text-gold hover:text-gold-light">Back to Login</Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}