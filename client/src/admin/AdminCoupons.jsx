import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiPower } from 'react-icons/fi';

const emptyForm = { code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', expiryDate: '', usageLimit: '', isActive: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/coupons?limit=200');
      setCoupons(res.data.data?.coupons || []);
    } catch (err) { toast.error('Failed to load coupons'); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderValue: c.minOrderValue || '', expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : '',
      usageLimit: c.usageLimit || '', isActive: c.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        usageLimit: Number(form.usageLimit) || 1
      };
      if (editing) {
        await API.put(`/coupons/${editing}`, payload);
        toast.success('Coupon updated');
      } else {
        await API.post('/coupons', payload);
        toast.success('Coupon created');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleActive = async (c) => {
    try {
      await API.put(`/coupons/${c._id}`, { isActive: !c.isActive });
      toast.success(c.isActive ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await API.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  const inputClass = "w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Coupons ({coupons.length})</h1>
        <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-2"><FiPlus size={16} /> Add Coupon</button>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10 text-theme-muted">
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Discount</th>
              <th className="p-3 text-left">Min Order</th>
              <th className="p-3 text-left">Usage</th>
              <th className="p-3 text-left">Expires</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-theme-muted">No coupons found</td></tr>
            ) : coupons.map(c => {
              const expired = new Date(c.expiryDate) < Date.now();
              return (
                <tr key={c._id} className="border-b border-gold/5 hover:bg-theme-tertiary/50">
                  <td className="p-3"><span className="text-gold font-semibold">{c.code}</span></td>
                  <td className="p-3 text-theme-secondary">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `\u20A8${c.discountValue}`}
                  </td>
                  <td className="p-3 text-theme-secondary">₨{c.minOrderValue?.toLocaleString()}</td>
                  <td className="p-3 text-theme-secondary">{c.usedCount} / {c.usageLimit}</td>
                  <td className="p-3 text-theme-secondary text-xs">{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${!c.isActive || expired ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {!c.isActive ? 'Inactive' : expired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(c)} title="Toggle active"
                        className={`p-2 rounded-lg transition-colors ${c.isActive ? 'bg-theme-tertiary text-theme-secondary hover:text-red-400' : 'bg-theme-tertiary text-theme-muted hover:text-green-400'}`}>
                        <FiPower size={14} />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-2 text-theme-secondary hover:text-gold"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 text-theme-secondary hover:text-red-400"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-theme-secondary border border-gold/20 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-theme-primary font-bold mb-6">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-theme-muted block mb-2">Coupon Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={inputClass} placeholder="e.g. SAVE10" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-theme-muted block mb-2">Type</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className={inputClass}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₨)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-theme-muted block mb-2">{form.discountType === 'percentage' ? 'Percent Off' : 'Amount Off'}</label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className={inputClass} min="1" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-theme-muted block mb-2">Min Order (₨)</label>
                  <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-theme-muted block mb-2">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className={inputClass} placeholder="100" />
                </div>
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className={inputClass} required />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-gold" />
                <span className="text-sm text-theme-secondary">Active</span>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-gold text-sm flex-1">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-gold-outline text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
