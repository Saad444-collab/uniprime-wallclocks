import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { formatPrice } = useCurrency();
  const isDark = theme === 'dark';

  const inWishlist = isInWishlist(product._id);
  const image = product.images?.[0] || 'https://placehold.co/400x400/1a1a1a/d4a843?text=Clock';

  const displayPrice = product.displayPrice ?? product.salePrice ?? product.price;
  const displaySalePrice = product.displaySalePrice ?? null;
  const hasSale = displaySalePrice !== null && displaySalePrice !== undefined && displaySalePrice < displayPrice;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="group relative">
      <div className="circular-card mx-auto">
        <img src={image} alt={product.name} loading="lazy" />
        <div className="overlay">
          <Link to={`/products/${product.slug}`} className="text-white font-semibold text-sm mb-1 hover:text-gold-light transition-colors">
            {product.name}
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            {hasSale ? (
              <>
                <span className="text-gold font-bold">{formatPrice(displaySalePrice)}</span>
                <span className="text-gray-500 text-xs line-through">{formatPrice(displayPrice)}</span>
              </>
            ) : (
              <span className="text-gold font-bold">{formatPrice(displayPrice)}</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }}
              className={`p-2 rounded-full transition-colors ${inWishlist ? 'text-red-400 bg-red-400/10' : 'text-white bg-white/10 hover:bg-white/20'}`}>
              <FiHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button onClick={(e) => { e.preventDefault(); addToCart(product._id); }}
              className="p-2 rounded-full bg-gold text-dark hover:bg-gold-dark transition-colors">
              <FiShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <Link to={`/products/${product.slug}`} className={`font-medium text-sm hover:text-gold-light transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {product.name}
        </Link>
        <div className="flex items-center justify-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} size={12} className={i < Math.round(product.rating) ? 'text-gold fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'} />
          ))}
          <span className={`text-xs ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({product.reviewsCount || 0})</span>
        </div>
      </div>
    </motion.div>
  );
}
