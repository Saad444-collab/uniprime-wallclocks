import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import AnimatedClock from '../components/AnimatedClock';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import API from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { FiTruck, FiShield, FiAward, FiHeadphones } from 'react-icons/fi';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { symbol, currency } = useCurrency();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, featRes] = await Promise.all([
          API.get(`/products?limit=8&sort=newest&currencyCode=${currency}`),
          API.get(`/products?featured=true&limit=6&currencyCode=${currency}`)
        ]);
        setProducts(prodRes.data.data?.products || []);
        setFeatured(featRes.data.data?.products || []);
      } catch (err) { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [currency]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-dark-500' : 'bg-[#F5F3EF]'}`}>
        <div className="clock-loader"></div>
      </div>
    );
  }

  return (
    <div>
      <Seo />
      <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
        <div className={`absolute inset-0 transition-colors duration-300 ${isDark ? 'bg-gradient-to-b from-dark-500 via-dark-500 to-dark-600' : 'bg-gradient-to-b from-[#F5F3EF] via-[#F5F3EF] to-[#EDE9E3]'}`}></div>
        <div className="absolute inset-0 opacity-10" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(212,168,67,0.3) 0%, transparent 70%)'
        }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="text-gold text-sm tracking-[0.3em] uppercase font-medium">Crafted in Pakistan</span>
              <h1 className={`font-serif text-4xl sm:text-5xl lg:text-7xl font-bold mt-4 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Time<br />
                <span className="text-gold-light">Reimagined</span>
              </h1>
              <p className={`mt-6 text-lg leading-relaxed max-w-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Discover our exclusive collection of handcrafted luxury wall clocks from Karachi. Where precision meets artistry.
              </p>
              <div className="flex gap-4 mt-8">
                <Link to="/products" className="btn-gold text-sm sm:text-base">Explore Collection</Link>
                <Link to="/products?bestSeller=true" className="btn-gold-outline text-sm sm:text-base">Best Sellers</Link>
              </div>
              <div className="flex gap-4 sm:gap-8 mt-8 sm:mt-12">
                {[
                  { value: '500+', label: 'Designs' },
                  { value: '50K+', label: 'Happy Customers' },
                  { value: '4.9', label: 'Avg Rating' }
                ].map((stat, i) => (
                  <div key={i} className="text-center min-w-0">
                    <div className="text-lg sm:text-2xl font-bold text-gold-light font-serif">{stat.value}</div>
                    <div className={`text-[10px] sm:text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex justify-center">
              <AnimatedClock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-dark-600/50' : 'bg-[#EDE9E3]/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
               { icon: FiTruck, title: 'Free Shipping', desc: `On orders above ${symbol} ${currency === 'PKR' ? '10,000' : '100'}` },
              { icon: FiShield, title: 'Premium Quality', desc: '2 year warranty' },
              { icon: FiAward, title: 'Trusted', desc: '50K+ happy customers' },
              { icon: FiHeadphones, title: 'Support', desc: 'We\'re here to help' }
            ].map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card text-center">
                <feat.icon className="text-gold mx-auto mb-3" size={28} />
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{feat.title}</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-sm tracking-[0.3em] uppercase">Curated Selection</span>
            <h2 className={`font-serif text-3xl sm:text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Featured Timepieces</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mt-4"></div>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active' }}
          >
            {featured.map(product => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* New Arrivals */}
      <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-dark-600/30' : 'bg-[#EDE9E3]/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-gold text-sm tracking-[0.3em] uppercase">Latest</span>
              <h2 className={`font-serif text-3xl sm:text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>New Arrivals</h2>
            </div>
            <Link to="/products" className="btn-gold-outline text-sm hidden sm:block">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(212,168,67,0.1) 0%, transparent 70%)'
        }}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className={`font-serif text-3xl sm:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to Transform<br />Your <span className="text-gold-light">Space</span>?
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Each clock is meticulously crafted to bring elegance and precision to your walls.
          </p>
          <Link to="/products" className="btn-gold text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4">Shop Now</Link>
        </div>
      </section>
    </div>
  );
}
