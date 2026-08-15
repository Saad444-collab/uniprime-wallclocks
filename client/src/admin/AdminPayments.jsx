import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiImage } from 'react-icons/fi';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await API.get('/easypaisa', { params });
      setPayments(res.data.data || []);
    } catch { toast.error('Failed to load payments'); }
    setLoading(false);
  };

  const handleVerify = async (id) => {
    if (!confirm('Verify this payment? This will confirm the order.')) return;
    try {
      await API.put(`/easypaisa/${id}/verify`);
      toast.success('Payment verified! Order confirmed.');
      fetchPayments();
      setSelectedPayment(null);
    } catch (err) { toast.error('Failed to verify'); }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) { toast.error('Rejection reason is required'); return; }
    try {
      await API.put(`/easypaisa/${selectedPayment._id}/reject`, { adminNote: rejectNote.trim() });
      toast.success('Payment rejected');
      fetchPayments();
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectNote('');
    } catch (err) { toast.error('Failed to reject'); }
  };

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    verified: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400'
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-theme-primary mb-6">Easypaisa Payments ({payments.length})</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'verified', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10 text-theme-muted">
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Transaction ID</th>
              <th className="p-3 text-left">Screenshot</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment._id} className="border-b border-gold/5 hover:bg-theme-tertiary/50">
                <td className="p-3 text-gold font-medium">{payment.order?.orderNumber || 'N/A'}</td>
                <td className="p-3">
                  <p className="text-theme-primary text-xs">{payment.user?.name}</p>
                  <p className="text-theme-muted text-xs">{payment.user?.email}</p>
                </td>
                <td className="p-3 text-gold">{payment.currency || 'PKR'} {payment.amount?.toLocaleString()}</td>
                <td className="p-3 text-theme-secondary uppercase text-xs">{payment.method}</td>
                <td className="p-3 text-theme-secondary text-xs">{payment.transactionId || '-'}</td>
                <td className="p-3">
                  {payment.screenshotUrl ? (
                    <button onClick={() => setShowScreenshot(payment.screenshotUrl)}
                      className="flex items-center gap-1 text-gold hover:text-gold-light text-xs">
                      <FiImage size={14} /> View
                    </button>
                  ) : '-'}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColors[payment.status] || ''}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="p-3 text-theme-secondary text-xs">{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {payment.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleVerify(payment._id)}
                        className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30">Verify</button>
                      <button onClick={() => { setSelectedPayment(payment); setShowRejectModal(true); }}
                        className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">Reject</button>
                    </div>
                  )}
                  {payment.adminNote && (
                    <p className="text-xs text-theme-muted mt-1 italic">Note: {payment.adminNote}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowScreenshot(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={showScreenshot} alt="Payment screenshot" className="w-full rounded-2xl" />
            <button onClick={() => setShowScreenshot(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg"><FiX size={18} /></button>
          </motion.div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setShowRejectModal(false); setRejectNote(''); }}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-theme-secondary border border-gold/20 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-theme-primary font-semibold mb-4">Reject Payment</h3>
            <p className="text-sm text-theme-secondary mb-4">Order: {selectedPayment?.order?.orderNumber}</p>
            <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (required)"
              className="w-full bg-theme-input text-theme-primary border border-red-400/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-400 h-24" required />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} className="btn-gold text-sm flex-1 bg-red-500 !bg-gradient-to-r from-red-500 to-red-600">Confirm Reject</button>
              <button onClick={() => { setShowRejectModal(false); setRejectNote(''); }} className="btn-gold-outline text-sm">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
