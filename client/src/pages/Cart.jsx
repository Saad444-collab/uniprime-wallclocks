import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import Seo from '../components/Seo';

export default function Cart() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { theme } = useTheme();
  const { formatPrice, getDisplayPrice, symbol, currency } = useCurrency();
  const isDark = theme === 'dark';
  const isPKR = currency === 'PKR';
  const shippingThreshold = isPKR ? 10000 : 100;
  const shippingFee = isPKR ? 49 : 4.99;
  const shipping = cartTotal >= shippingThreshold ? 0 : shippingFee;

  if (cartCount === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag size={64} className="text-gold mx-auto mb-4" />
          <h2 className={`font-serif text-2xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Cart is Empty</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>Add some luxury timepieces to your collection</p>
          <Link to="/products" className="btn-gold">Browse Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Shopping Cart" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Shopping Cart</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{cartCount} items</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors">Clear All</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div key={item.product?._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card">
                <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gold/10">
                  <img src={item.product?.images?.[0] || 'https://placehold.co/200x200/1a1a1a/d4a843?text=Clock'}
                    alt={item.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product?.slug}`} className={`font-medium hover:text-gold transition-colors text-xs sm:text-sm block truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.product?.name || 'Product'}
                  </Link>
                  <p className="text-gold font-semibold mt-1 text-xs sm:text-sm">
                    {formatPrice(getDisplayPrice(item.product))}
                  </p>
                </div>
                <div className={`flex items-center border border-gold/20 rounded-lg`}>
                  <button onClick={() => updateQuantity(item.product?._id, Math.max(1, item.quantity - 1))}
                    className="p-1.5 sm:p-2 text-gold hover:bg-gold/10"><FiMinus size={14} /></button>
                  <span className={`px-2 sm:px-4 text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                    className="p-1.5 sm:p-2 text-gold hover:bg-gold/10"><FiPlus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.product?._id)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <FiTrash2 size={16} />
                </button>
                </div>
                <div className="flex justify-between items-center mt-2 sm:hidden">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subtotal</span>
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPrice(getDisplayPrice(item.product) * item.quantity)}
                  </p>
                </div>
                <div className="hidden sm:block text-right min-w-[80px]">
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatPrice(getDisplayPrice(item.product) * item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card h-fit">
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Subtotal</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatPrice(cartTotal)}</span>
              </div>
              <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : isDark ? 'text-white' : 'text-gray-900'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className={`border-t ${isDark ? 'border-gold/10' : 'border-gray-200'} pt-3 flex justify-between font-semibold`}>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
                <span className="text-gold text-lg">{formatPrice(cartTotal + shipping)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-gold w-full text-center block mt-6 text-sm">Proceed to Checkout</Link>
            <Link to="/products" className={`flex items-center justify-center gap-2 mt-4 text-sm hover:text-gold transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
