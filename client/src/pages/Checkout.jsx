import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

const PROOF_METHODS = ['easypaisa', 'jazzcash', 'bank'];

const methodLabels = {
  cod: 'Cash on Delivery',
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
  card: 'Card',
  upi: 'UPI',
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { formatPrice, getDisplayPrice, symbol, currency } = useCurrency();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  useEffect(() => {
    API.get('/payment-settings')
      .then(res => {
        const active = (res.data.data || []).filter(m => m.isActive !== false);
        setPaymentMethods(active);
        if (active.length && active.every(m => m.method !== paymentMethod)) {
          setPaymentMethod(active[0].method);
        }
      })
      .catch(() => setPaymentMethods([{ method: 'cod', isActive: true }, { method: 'easypaisa', isActive: true }]));
  }, []);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await API.post('/orders/validate-coupon', { couponCode: couponCode.trim(), subtotal: cartTotal });
      setDiscount(res.data.data?.discount || 0);
      setCouponMsg(`Coupon applied! You save ${formatPrice(res.data.data?.discount || 0)}`);
      toast.success('Coupon applied');
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.response?.data?.message || 'Invalid coupon');
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) { toast.error('Cart is empty'); return; }
    if (loading) return;
    setLoading(true);
    try {
      const items = cart.map(item => ({
        product: item.product?._id,
        quantity: item.quantity
      }));
      const res = await API.post('/orders', {
        items,
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        currencyCode: currency
      });

      if (PROOF_METHODS.includes(paymentMethod)) {
        clearCart();
        navigate(`/easypaisa-payment/${res.data.data._id}`);
        return;
      }

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
    setLoading(false);
  };

  const isPKR = currency === 'PKR';
  const shippingThreshold = isPKR ? 10000 : 100;
  const shippingFee = isPKR ? 49 : 4.99;
  const shipping = cartTotal >= shippingThreshold ? 0 : shippingFee;
  const totalAfterDiscount = Math.max(0, cartTotal + shipping - discount);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Checkout" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Shipping Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Coupon Code</h3>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className={`flex-1 ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold uppercase`} />
                  <button type="button" onClick={applyCoupon} className="btn-gold text-sm">Apply</button>
                </div>
                {couponMsg && <p className={`text-xs mt-2 ${discount > 0 ? 'text-green-400' : 'text-red-400'}`}>{couponMsg}</p>}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Payment Method</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map(method => (
                    <button key={method.method} type="button" onClick={() => setPaymentMethod(method.method)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        paymentMethod === method.method ? 'border-gold bg-gold/10 text-gold' : `border-gold/20 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold`
                      }`}>
                      {methodLabels[method.method] || method.method}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="glass-card h-fit">
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold mb-4`}>Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gold/10 flex-shrink-0">
                      <img src={item.product?.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-xs truncate`}>{item.product?.name}</p>
                      <p className="text-gold text-xs font-medium">x{item.quantity}</p>
                    </div>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-xs font-medium`}>{formatPrice(getDisplayPrice(item.product) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gold/10 pt-3 space-y-2 text-sm">
                <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Subtotal</span><span className={isDark ? 'text-white' : 'text-gray-900'}>{formatPrice(cartTotal)}</span>
                </div>
                <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Shipping</span><span className={shipping === 0 ? 'text-green-400' : isDark ? 'text-white' : 'text-gray-900'}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Discount</span><span className="text-green-400">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gold/10 pt-2 flex justify-between font-semibold">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
                  <span className="text-gold text-lg">{formatPrice(totalAfterDiscount)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-gold w-full mt-6 text-sm py-3 disabled:opacity-50">
                {loading ? 'Processing...' : `Place Order \u2022 ${formatPrice(totalAfterDiscount)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
