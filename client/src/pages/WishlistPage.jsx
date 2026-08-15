import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { FiHeart } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function WishlistPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const res = await API.get('/wishlist');
        setProducts(res.data.data?.products || []);
      } catch { setProducts([]); }
      setLoading(false);
    };
    fetchWishlistProducts();
  }, [user]);

  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiHeart size={64} className="text-gold mx-auto mb-4" />
          <h2 className={`font-serif text-2xl ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Login to View Wishlist</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>Save your favorite timepieces</p>
          <Link to="/login" className="btn-gold">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="clock-loader"></div></div>;
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="My Wishlist" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>My Wishlist</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8`}>{products.length} items saved</p>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart size={48} className="text-gold mx-auto mb-4" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your wishlist is empty</p>
            <Link to="/products" className="btn-gold mt-4 inline-block">Explore Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
