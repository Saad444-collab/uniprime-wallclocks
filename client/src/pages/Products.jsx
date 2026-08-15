import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Seo from '../components/Seo';
import API from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const { theme } = useTheme();
  const { currency } = useCurrency();
  const isDark = theme === 'dark';

  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort, currencyCode: currency };
        let catValue = category;
        if (category && !/^[0-9a-fA-F]{24}$/.test(category)) {
          const cat = categories.find(c => c.slug === category);
          if (cat) catValue = cat._id;
        }
        if (catValue) params.category = catValue;
        if (search) params.search = search;
        const res = await API.get('/products', { params });
        setProducts(res.data.data?.products || []);
        setTotal(res.data.data?.total || 0);
        setPages(res.data.data?.pages || 1);
      } catch (err) { /* ignore */ }
      setLoading(false);
    };
    fetchProducts();
  }, [page, category, sort, search, currency, categories]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Our Collections" description="Explore our premium wall clock collections. Luxury handcrafted wall clocks for home and office, with nationwide delivery across Pakistan." path="/products" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`font-serif text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Collections</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{total} timepieces available</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 glass-card">
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 hover:text-gold text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <FiFilter size={16} /> Filters
            </button>
            <select value={sort} onChange={(e) => updateParams('sort', e.target.value)}
              className={`border border-gold/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold ${isDark ? 'bg-dark-300 text-gray-300' : 'bg-white text-gray-600'}`}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
            </select>
            {categories.map(cat => (
              <button key={cat._id} onClick={() => updateParams('category', category === cat._id ? '' : cat._id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat._id ? 'bg-gold text-dark' : isDark ? 'bg-dark-300 text-gray-400 hover:text-gold border border-gold/10' : 'bg-gray-100 text-gray-500 hover:text-gold border border-gray-200'
                }`}>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gold text-dark' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FiGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gold text-dark' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FiList size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="clock-loader"></div></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-lg`}>No products found</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
          }`}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <Pagination page={page} pages={pages} onChange={(p) => updateParams('page', String(p))} />
        )}
      </div>
    </div>
  );
}
