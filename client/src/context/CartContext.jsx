import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { getDisplayPrice } = useCurrency();

  useEffect(() => {
    if (user) fetchCart();
    else {
      setCart([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/cart');
      setCart(res.data.data || []);
    } catch { setCart([]); }
    setLoading(false);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      if (!user) { toast.error('Please login first'); return; }
      const res = await API.post('/users/cart/add', { productId, quantity });
      setCart(res.data.data || []);
      toast.success('Added to cart');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  const removeFromCart = async (productId) => {
    try {
      if (!productId) {
        await fetchCart();
        return;
      }
      const res = await API.post('/users/cart/remove', { productId });
      setCart(res.data.data || []);
      toast.success('Removed from cart');
    } catch (err) { toast.error('Failed to remove'); }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (!productId) return;
      const res = await API.put('/users/cart/update', { productId, quantity });
      setCart(res.data.data || []);
    } catch (err) { toast.error('Failed to update'); }
  };

  const clearCart = async () => {
    try {
      await API.delete('/users/cart/clear');
      setCart([]);
    } catch (err) { toast.error('Failed to clear'); }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + getDisplayPrice(item.product) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
