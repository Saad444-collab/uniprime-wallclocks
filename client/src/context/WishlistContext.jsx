import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist([]);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await API.get('/wishlist');
      setWishlist(res.data.data?.products || []);
    } catch { setWishlist([]); }
  };

  const toggleWishlist = async (productId) => {
    try {
      if (!user) { toast.error('Please login first'); return; }
      const exists = wishlist.some(id => id && (id === productId || id._id === productId));
      if (exists) {
        const res = await API.delete(`/wishlist/${productId}`);
        setWishlist(res.data.data?.products || []);
        toast.success('Removed from wishlist');
      } else {
        const res = await API.post(`/wishlist/${productId}`);
        setWishlist(res.data.data?.products || []);
        toast.success('Added to wishlist');
      }
    } catch (err) { toast.error('Failed to update wishlist'); }
  };

  const isInWishlist = (productId) => wishlist.some(id => id && (id === productId || id._id === productId));

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
