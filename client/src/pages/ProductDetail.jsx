import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { FiStar, FiHeart, FiShoppingCart, FiShare2, FiMinus, FiPlus, FiCheck, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Seo from '../components/Seo';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { theme } = useTheme();
  const { formatPrice, symbol, currency } = useCurrency();
  const isDark = theme === 'dark';
  const maxQty = product?.stock ?? 1;
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${slug}?currencyCode=${currency}`);
        if (!res.data.data) { toast.error('Product not found'); setLoading(false); return; }
        setProduct(res.data.data);
        const revRes = await API.get(`/products/${res.data.data._id}/reviews`);
        setReviews(revRes.data.data || []);
      } catch (err) { toast.error('Product not found'); }
      setLoading(false);
    };
    fetchProduct();
  }, [slug, currency]);

  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setReviewImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeReviewImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('rating', reviewForm.rating);
      formData.append('comment', reviewForm.comment);
      reviewImages.forEach(img => formData.append('reviewImages', img));
      await API.post(`/products/${product._id}/reviews`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Review submitted');
      const revRes = await API.get(`/products/${product._id}/reviews`);
      setReviews(revRes.data.data || []);
      setReviewForm({ rating: 5, comment: '' });
      setReviewImages([]);
      setReviewImagePreviews([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="clock-loader"></div></div>;
  }
  if (!product) {
    return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Product not found</div>;
  }

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600/1a1a1a/d4a843?text=Clock'];
  const inWishlist = isInWishlist(product._id);

  const displayPrice = product.displayPrice ?? product.price;
  const displaySalePrice = product.displaySalePrice ?? null;
  const hasSale = displaySalePrice !== null && displaySalePrice !== undefined && displaySalePrice < displayPrice;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.[0] || '/clock-icon.svg',
    description: product.description || product.name,
    sku: product._id,
    brand: { '@type': 'Brand', name: 'UniPrime Wall Clocks' },
    offers: {
      '@type': 'Offer',
      url: `https://uniprimewallclocks.com/products/${product.slug}`,
      priceCurrency: 'PKR',
      price: String(hasSale ? displaySalePrice : displayPrice),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://uniprimewallclocks.com/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://uniprimewallclocks.com/products' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://uniprimewallclocks.com/products/${product.slug}` }
    ]
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo
        title={product.name}
        description={product.description ? product.description.slice(0, 155) : `Buy ${product.name} online in Pakistan`}
        image={product.images?.[0] || '/clock-icon.svg'}
        path={`/products/${product.slug}`}
        type="product"
        jsonLd={productJsonLd}
        jsonLdExtra={breadcrumbJsonLd}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gold">Products</Link>
          <span>/</span>
          <span className="text-gold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className={`relative rounded-2xl overflow-hidden border border-gold/20 mb-4`}>
              <Swiper navigation thumbs={{ swiper: thumbsSwiper }} modules={[Navigation, Thumbs]} className="w-full aspect-square">
                {images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            {images.length > 1 && (
              <Swiper onSwiper={setThumbsSwiper} spaceBetween={10} slidesPerView={4} watchSlidesProgress className="thumbs-swiper">
                {images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt="" className="w-full aspect-square object-cover rounded-lg border border-gold/20 cursor-pointer" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              {product.bestSeller && <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full">Best Seller</span>}
              {product.newArrival && <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">New</span>}
              {hasSale && <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                {displayPrice > 0 ? Math.round((1 - displaySalePrice / displayPrice) * 100) : 0}% OFF
              </span>}
            </div>

            <h1 className={`font-serif text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h1>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} size={16} className={i < Math.round(product.rating) ? 'text-gold fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'} />
                ))}
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm ml-2`}>({product.reviewsCount || 0} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              {hasSale ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-gold">{formatPrice(displaySalePrice)}</span>
                  <span className={`text-base sm:text-xl line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatPrice(displayPrice)}</span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-gold">{formatPrice(displayPrice)}</span>
              )}
            </div>

            <p className={`mt-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mt-8 p-6 glass-card">
              {[
                { label: 'SKU', value: product.sku },
                { label: 'Material', value: product.material },
                { label: 'Color', value: product.color },
                { label: 'Dimensions', value: product.dimensions },
                { label: 'Weight', value: product.weight },
                { label: 'Warranty', value: product.warranty || '2 Years' },
              ].filter(s => s.value).map((spec, i) => (
                <div key={i}>
                  <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{spec.label}</span>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mt-8">
              <div className={`flex items-center border border-gold/30 rounded-lg`}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 sm:p-3 text-gold hover:bg-gold/10"><FiMinus size={16} /></button>
                <span className={`px-4 sm:px-6 text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty}
                  className="p-2.5 sm:p-3 text-gold hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed"><FiPlus size={16} /></button>
              </div>
              <button onClick={() => addToCart(product._id, quantity)} className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-3.5">
                <FiShoppingCart size={18} /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
              </button>
              <button onClick={() => toggleWishlist(product._id)}
                className={`p-2.5 sm:p-3 rounded-lg border transition-all ${inWishlist ? 'border-red-400 text-red-400' : isDark ? 'border-gold/20 text-gray-400 hover:text-gold' : 'border-gray-200 text-gray-400 hover:text-gold'}`}>
                <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className={`flex flex-wrap gap-6 mt-8 pt-6 border-t ${isDark ? 'border-gold/10' : 'border-gray-200'}`}>
              {[
                { icon: FiTruck, text: `Free shipping on orders above ${symbol} ${currency === 'PKR' ? '10,000' : '100'}` },
                { icon: FiShield, text: '2 Year warranty' },
              ].map((svc, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <svc.icon className="text-gold" size={16} /> {svc.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <h2 className={`font-serif text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No reviews yet. Be the first!</p>
              ) : reviews.map(review => (
                <div key={review._id} className="glass-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{review.user?.name || 'Anonymous'}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={12} className={i < review.rating ? 'text-gold fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{review.comment}</p>
                  <span className={`text-xs mt-2 block ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <div className="glass-card">
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                        className={`p-2 rounded ${r <= reviewForm.rating ? 'text-gold' : isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                        <FiStar size={20} fill={r <= reviewForm.rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className={`w-full border border-gold/20 rounded-lg p-4 text-sm focus:outline-none focus:border-gold resize-none h-24 ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'}`} required />
                <div>
                  <label className={`text-xs block mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add Photos (optional)</label>
                  <input type="file" multiple accept="image/*" onChange={handleReviewImageChange}
                    className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-gold file:text-dark file:font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  {reviewImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reviewImagePreviews.map((preview, i) => (
                        <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gold/20 group">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeReviewImage(i)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs">X</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-gold w-full text-sm">Submit Review</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
