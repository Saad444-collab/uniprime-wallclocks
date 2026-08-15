import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { FiUpload, FiCheck, FiX, FiAlertCircle, FiArrowLeft, FiCopy, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import Seo from '../components/Seo';

const METHOD_INFO = {
  easypaisa: { title: 'Easypaisa Payment', appName: 'Easypaisa', numberLabel: 'Easypaisa Number', txnPlaceholder: 'Easypaisa transaction reference' },
  jazzcash: { title: 'JazzCash Payment', appName: 'JazzCash', numberLabel: 'JazzCash Number', txnPlaceholder: 'JazzCash transaction reference' },
  bank: { title: 'Bank Transfer Payment', appName: 'Bank', numberLabel: 'Bank Account Number', txnPlaceholder: 'Bank transfer reference / slip number' },
};

export default function EasypaisaPayment() {
  const { orderId } = useParams();
  const { theme } = useTheme();
  const { symbol } = useCurrency();
  const isDark = theme === 'dark';
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await API.get(`/orders/${orderId}`);
        setOrder(orderRes.data.data);
        const method = orderRes.data.data?.paymentMethod || 'easypaisa';
        const settingsRes = await API.get(`/payment-settings/${method}`);
        setSettings(settingsRes.data.data);
      } catch {
        toast.error('Failed to load payment info');
      }
      setLoading(false);
    };
    fetchData();
  }, [orderId]);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const res = await API.get('/easypaisa/my-payments');
      const payment = res.data.data?.find(p => p.order?._id === orderId || p.order?.toString() === orderId);
      if (payment) {
        setPaymentStatus(payment.status);
        if (payment.status === 'verified' || payment.status === 'pending') {
          setSubmitted(true);
        }
      }
    } catch { /* ignore */ }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      checkPaymentStatus();
    }
  }, [order, checkPaymentStatus]);

  const handleFile = (file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WebP files are allowed');
      return;
    }
    if (file.size > maxSize) {
      toast.error('File size must be under 5MB');
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) { toast.error('Please upload a payment screenshot'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('orderId', orderId);
      if (transactionId.trim()) formData.append('transactionId', transactionId.trim());
      await API.post(`/easypaisa/submit/${order.paymentMethod}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Payment proof submitted! Awaiting admin verification.');
      setSubmitted(true);
      setPaymentStatus('pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="clock-loader"></div></div>;
  }

  if (!order) {
    return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order not found</div>;
  }

  const method = order.paymentMethod || 'easypaisa';
  const info = METHOD_INFO[method] || METHOD_INFO.easypaisa;

  const formatOrderAmount = (amount) => {
    const code = order.currencyCode;
    const sym = order.currencySymbol || symbol;
    if (code === 'PKR') {
      return `${sym} ${Math.round(amount || 0).toLocaleString()}`;
    }
    return `${sym}${(Number(amount) || 0).toFixed(2)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Make Payment" noindex />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/profile" className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold mb-6 transition-colors`}>
          <FiArrowLeft size={14} /> Back to Profile
        </Link>

        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>{info.title}</h1>

        {paymentStatus === 'verified' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <FiCheck size={36} className="text-green-400" />
            </div>
            <h2 className={`font-serif text-2xl ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Payment Verified</h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Your payment has been verified. Your order is confirmed.</p>
            <Link to="/profile" className="btn-gold inline-block mt-6 text-sm">View Order</Link>
          </motion.div>
        ) : paymentStatus === 'rejected' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center py-12">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <FiX size={36} className="text-red-400" />
            </div>
            <h2 className={`font-serif text-2xl ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Payment Rejected</h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Your payment proof was rejected. Please upload a new screenshot.</p>
            <button onClick={() => { setSubmitted(false); setPaymentStatus(null); setScreenshot(null); setPreview(''); }}
              className="btn-gold mt-6 text-sm inline-block">Upload New Proof</button>
          </motion.div>
        ) : submitted ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
              <FiUpload size={36} className="text-gold" />
            </div>
            <h2 className={`font-serif text-2xl ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Payment Proof Submitted</h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Your payment proof is awaiting admin verification. This usually takes a few hours.</p>
            <Link to="/profile" className="btn-gold inline-block mt-6 text-sm">View Order</Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Order Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Order Number</span>
                  <p className="text-gold font-medium mt-1">{order.orderNumber}</p>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Total Amount</span>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-lg mt-1`}>{formatOrderAmount(order.totalAmount)}</p>
                </div>
              </div>
            </motion.div>

            {settings && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card border-gold/30 bg-gold/5">
                <h3 className="text-gold font-semibold mb-4">{info.appName} Account Details</h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-dark-300' : 'bg-white'} rounded-lg`}>
                    <div>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block`}>Account Name</span>
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>{settings.accountName}</span>
                    </div>
                    <button onClick={() => copyToClipboard(settings.accountName)} className="text-gold hover:text-gold-light"><FiCopy size={14} /></button>
                  </div>
                  <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-dark-300' : 'bg-white'} rounded-lg`}>
                    <div>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block`}>{info.numberLabel}</span>
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>{settings.accountNumber}</span>
                    </div>
                    <button onClick={() => copyToClipboard(settings.accountNumber)} className="text-gold hover:text-gold-light"><FiCopy size={14} /></button>
                  </div>
                  <div className={`flex items-center justify-between p-3 ${isDark ? 'bg-dark-300' : 'bg-white'} rounded-lg`}>
                    <div>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block`}>Amount to Send</span>
                      <span className="text-gold text-lg font-bold">{formatOrderAmount(order.totalAmount)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(`${order.totalAmount}`)} className="text-gold hover:text-gold-light"><FiCopy size={14} /></button>
                  </div>
                </div>
                {settings?.qrCode && (
                  <div className="mt-4 flex justify-center">
                    <img src={settings.qrCode} alt="Payment QR code" className="w-40 h-40 rounded-lg border border-gold/20 object-contain" />
                  </div>
                )}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Payment Instructions</h3>
              <ol className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} list-decimal list-inside`}>
                <li>Open your <strong className={isDark ? 'text-white' : 'text-gray-900'}>{info.appName}</strong> app</li>
                <li>Select <strong className={isDark ? 'text-white' : 'text-gray-900'}>Send Money</strong></li>
                <li>Enter the {info.numberLabel}: <strong className="text-gold">{settings?.accountNumber || 'N/A'}</strong></li>
                <li>Enter the exact amount: <strong className="text-gold">{formatOrderAmount(order.totalAmount)}</strong></li>
                <li>Complete the payment</li>
                <li>Take a <strong className={isDark ? 'text-white' : 'text-gray-900'}>screenshot</strong> of the successful payment</li>
                <li>Upload the screenshot below and submit</li>
              </ol>
            </motion.div>

            <form onSubmit={handleSubmit}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Upload Payment Screenshot</h3>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragOver ? 'border-gold bg-gold/10' : preview ? 'border-green-500/50 bg-green-500/5' : 'border-gold/20 hover:border-gold/40'
                  }`}>
                  {preview ? (
                    <div className="relative inline-block">
                      <img src={preview} alt="Screenshot preview" className="max-h-64 rounded-xl mx-auto" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setScreenshot(null); setPreview(''); }}
                        className={`absolute -top-2 -right-2 bg-red-500 ${isDark ? 'text-white' : 'text-gray-900'} rounded-full p-1 shadow-lg`}>
                        <FiX size={14} />
                      </button>
                      <p className="text-xs text-green-400 mt-2">{screenshot?.name} ({(screenshot?.size / 1024).toFixed(1)} KB)</p>
                    </div>
                  ) : (
                    <div>
                      <FiUpload size={40} className={`mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Drag & drop your payment screenshot here, or <span className="text-gold">click to browse</span></p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>JPG, JPEG, PNG, WebP (max 5MB)</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ''; }} className="hidden" />
                </div>

                <div className="mt-4">
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Transaction ID (Optional)</label>
                  <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={info.txnPlaceholder}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} />
                </div>

                <button type="submit" disabled={submitting} className="btn-gold w-full mt-6 text-sm py-3 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                </button>
              </motion.div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
