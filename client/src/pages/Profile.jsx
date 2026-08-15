import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Link } from 'react-router';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function Profile() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user, getMe } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '' });
      API.get('/orders/my-orders').then(res => setOrders(res.data.data || [])).catch(() => {});
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/users/${user._id}`, profile);
      await getMe();
      toast.success('Profile updated');
    } catch (err) { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await API.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      const res = await API.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel order'); }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const existingAddresses = user.addresses || [];
      await API.put(`/users/${user._id}`, {
        addresses: [...existingAddresses, { ...address, isDefault: existingAddresses.length === 0 }]
      });
      await getMe();
      toast.success('Address added');
      setAddress({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '' });
    } catch (err) { toast.error('Failed to add address'); }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="My Account" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>My Account</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card">
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold flex items-center gap-2 mb-4`}><FiUser size={16} /> Profile Information</h3>
              <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Phone</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} />
                </div>
                <div className="sm:col-span-2">
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Email</label>
                  <input type="email" value={user?.email || ''} disabled
                    className={`w-full ${isDark ? 'bg-dark-400 text-gray-400' : 'bg-gray-50 text-gray-500'} border border-gold/10 rounded-lg px-4 py-3 text-sm cursor-not-allowed`} />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={saving} className="btn-gold text-sm">{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card">
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold flex items-center gap-2 mb-4`}><FiMapPin size={16} /> Add Address</h3>
              <form onSubmit={addAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Full Name</label>
                  <input type="text" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Phone</label>
                  <input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Street</label>
                  <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>City</label>
                  <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>State</label>
                  <input type="text" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>ZIP Code</label>
                  <input type="text" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-gold text-sm">Add Address</button>
                </div>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card">
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold flex items-center gap-2 mb-4`}><FiPackage size={16} /> Order History</h3>
              {orders.length === 0 ? (
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gold/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gold text-sm font-medium">{order.orderNumber}</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-gold/20 text-gold'
                        }`}>{order.orderStatus}</span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{order.items?.length} item(s) - {order.currencySymbol || '₨'}{order.totalAmount?.toLocaleString()}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      <div className="flex gap-3 mt-2">
                        {order.paymentMethod === 'easypaisa' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'verified' && (
                          <Link to={`/easypaisa-payment/${order._id}`}
                            className="text-xs flex items-center gap-1 text-gold hover:text-gold-light">
                            <FiAlertCircle size={12} /> {order.paymentStatus === 'rejected' ? 'Re-upload Proof' : 'Submit Payment'}
                          </Link>
                        )}
                        {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && order.paymentStatus !== 'paid' && (
                          <button onClick={() => cancelOrder(order._id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel Order</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="glass-card h-fit">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-dark-300' : 'bg-white'} border-2 border-gold flex items-center justify-center mx-auto`}>
                <FiUser size={32} className="text-gold" />
              </div>
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mt-3`}>{user?.name}</h3>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}>{user?.email}</p>
              <span className="text-xs text-gold mt-1 block capitalize">{user?.role}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className={`flex items-center gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <FiMail size={14} className="text-gold" /> {user?.email}
              </div>
              {user?.phone && (
                <div className={`flex items-center gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiPhone size={14} className="text-gold" /> {user?.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
