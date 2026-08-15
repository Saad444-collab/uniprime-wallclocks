import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiImage } from 'react-icons/fi';

const METHODS = [
  { id: 'easypaisa', label: 'Easypaisa', type: 'wallet' },
  { id: 'jazzcash', label: 'JazzCash', type: 'wallet' },
  { id: 'bank', label: 'Bank Transfer', type: 'bank' },
  { id: 'cod', label: 'Cash on Delivery', type: 'cod' },
];

export default function AdminPaymentSettings() {
  const [activeMethod, setActiveMethod] = useState('easypaisa');
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all(METHODS.map(m => API.get(`/payment-settings/${m.id}`)))
      .then(responses => {
        const data = {};
        responses.forEach((res, i) => {
          const d = res.data.data;
          data[METHODS[i].id] = {
            accountName: d.accountName || '',
            accountNumber: d.accountNumber || '',
            instructions: d.instructions || '',
            qrCode: d.qrCode || '',
            isActive: d.isActive !== false,
          };
        });
        setForms(data);
      })
      .catch(() => toast.error('Failed to load payment settings'))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (field, value) => {
    setForms(prev => ({ ...prev, [activeMethod]: { ...prev[activeMethod], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = forms[activeMethod];
      const payload = { ...form };
      delete payload.qrCode;
      await API.put(`/payment-settings/${activeMethod}`, payload);
      toast.success('Payment settings updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await API.post('/uploads/qr', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.data?.url || res.data.data?.path || res.data.url;
      updateForm('qrCode', url);
      toast.success('QR code uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR upload failed');
    }
    e.target.value = '';
  };

  const method = METHODS.find(m => m.id === activeMethod);
  const form = forms[activeMethod];

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;
  if (!form) return null;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-theme-primary mb-6">Payment Settings</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {METHODS.map(m => (
          <button key={m.id} onClick={() => setActiveMethod(m.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeMethod === m.id ? 'bg-gold text-dark border-gold' : 'bg-theme-tertiary text-theme-secondary hover:text-gold border-gold/10'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      <motion.div key={activeMethod} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {method.type !== 'cod' && (
            <>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Account Name</label>
                <input type="text" value={form.accountName} onChange={(e) => updateForm('accountName', e.target.value)}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">
                  {method.type === 'wallet' ? 'Mobile Number' : 'Account Number / IBAN'}
                </label>
                <input type="text" value={form.accountNumber} onChange={(e) => updateForm('accountNumber', e.target.value)}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
            </>
          )}
          <div>
            <label className="text-xs text-theme-muted block mb-2">Payment Instructions</label>
            <textarea value={form.instructions} onChange={(e) => updateForm('instructions', e.target.value)}
              className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold h-32" />
          </div>
          {method.type !== 'cod' && (
            <div>
              <label className="text-xs text-theme-muted block mb-2">QR Code</label>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleQRUpload}
                  className="w-full bg-theme-input text-theme-secondary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-gold file:text-dark file:font-semibold hover:file:bg-gold-dark" />
                {form.qrCode && (
                  <img src={form.qrCode} alt="QR" className="w-20 h-20 rounded-lg border border-gold/20 object-contain flex-shrink-0" />
                )}
              </div>
              {form.qrCode && (
                <button type="button" onClick={() => updateForm('qrCode', '')}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <FiImage size={12} /> Remove QR code
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.isActive} onChange={(e) => updateForm('isActive', e.target.checked)}
              className="w-4 h-4 accent-gold" />
            <span className="text-sm text-theme-secondary">{method.label} payment is active</span>
          </div>
          <button type="submit" disabled={saving} className="btn-gold text-sm flex items-center gap-2">
            <FiSave size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
