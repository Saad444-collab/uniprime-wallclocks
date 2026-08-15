import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiStar, FiSearch, FiDownload, FiCheckSquare, FiBox } from 'react-icons/fi';
import Pagination from '../components/Pagination';

const CURRENCIES = [
  { code: 'PKR', symbol: '\u20A8', label: 'Pakistan (PKR)' },
  { code: 'USD', symbol: '$', label: 'USA (USD)' },
  { code: 'GBP', symbol: '\u00A3', label: 'UK (GBP)' },
  { code: 'EUR', symbol: '\u20AC', label: 'Europe (EUR)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canada (CAD)' },
  { code: 'AUD', symbol: 'A$', label: 'Australia (AUD)' },
  { code: 'AED', symbol: '\u062F.\u0625', label: 'UAE (AED)' },
  { code: 'SAR', symbol: '\uFEFD', label: 'Saudi Arabia (SAR)' },
];

const STATUSES = [
  { key: '', label: 'All Status' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const SORTS = [
  { key: 'createdAt', label: 'Newest' },
  { key: 'name', label: 'Name A-Z' },
  { key: 'stock-asc', label: 'Stock: Low-High' },
  { key: 'price-asc', label: 'Price: Low-High' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkStock, setBulkStock] = useState('');
  const [showBulkStock, setShowBulkStock] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '', salePrice: '',
    sku: '', category: '', brand: '', material: '', color: '', dimensions: '',
    weight: '', stock: '', featured: false, bestSeller: false, newArrival: false
  });
  const [multiPrices, setMultiPrices] = useState({});
  const [multiSalePrices, setMultiSalePrices] = useState({});
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [filterCategory, setFilterCategory] = useState('');
  const searchTimeout = useRef(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort, filterCategory]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchData();
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search, page, status, sort, filterCategory]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/products/all', { params: { search: search.trim() || undefined, limit: 15, page, status: status || undefined, sort: sort || undefined, category: filterCategory || undefined } }),
        API.get('/categories')
      ]);
      setProducts(prodRes.data.data?.products || []);
      setTotal(prodRes.data.data?.total || 0);
      setPages(prodRes.data.data?.pages || 1);
      setCategories(catRes.data.data || []);
    } catch (err) { toast.error('Failed to load'); }
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map(p => p._id));
  };

  const handleBulkAction = async (action, value) => {
    if (selected.length === 0) { toast.error('Select products first'); return; }
    try {
      await API.post('/products/bulk', { ids: selected, action, value });
      toast.success('Bulk update applied');
      setSelected([]);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk action failed'); }
  };

  const handleBulkStock = async () => {
    const stock = Number(bulkStock);
    if (!Number.isFinite(stock) || stock < 0) { toast.error('Enter a valid stock value'); return; }
    await handleBulkAction('stock', stock);
    setBulkStock('');
    setShowBulkStock(false);
  };

  const exportCsv = async () => {
    try {
      const res = await API.get('/products/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { toast.error('Export failed'); }
  };

  const handleRemoveExistingImage = async (index) => {
    if (!editing) return;
    try {
      await API.delete(`/products/${editing}/image/${index}`);
      toast.success('Image removed');
      const newExisting = [...existingImages];
      newExisting.splice(index, 1);
      setExistingImages(newExisting);
    } catch (err) { toast.error('Failed to remove image'); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', shortDescription: '', price: '', salePrice: '', sku: '', category: '', brand: '', material: '', color: '', dimensions: '', weight: '', stock: '', featured: false, bestSeller: false, newArrival: false });
    setMultiPrices({});
    setMultiSalePrices({});
    setImages([]);
    setExistingImages([]);
    setNewImagePreviews([]);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name, description: product.description, shortDescription: product.shortDescription || '',
      price: product.price, salePrice: product.salePrice || '', sku: product.sku,
      category: product.category?._id || product.category || '', brand: product.brand || '',
      material: product.material || '', color: product.color || '', dimensions: product.dimensions || '',
      weight: product.weight || '', stock: product.stock, featured: product.featured,
      bestSeller: product.bestSeller, newArrival: product.newArrival
    });
    const mp = {};
    const msp = {};
    if (product.multiCurrencyPrices) {
      const raw = typeof product.multiCurrencyPrices === 'object' ? product.multiCurrencyPrices : {};
      Object.entries(raw).forEach(([k, v]) => {
        if (k.endsWith('_sale')) msp[k.replace('_sale', '')] = v;
        else mp[k] = v;
      });
    }
    setMultiPrices(mp);
    setMultiSalePrices(msp);
    setExistingImages(product.images || []);
    setImages([]);
    setNewImagePreviews([]);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (typeof val === 'boolean') formData.append(key, val ? 'true' : 'false');
        else formData.append(key, val);
      });
      formData.set('price', Number(form.price));
      formData.set('stock', Number(form.stock));
      if (form.salePrice) formData.set('salePrice', Number(form.salePrice));

      for (const curr of CURRENCIES.filter(c => c.code !== 'PKR')) {
        const val = multiPrices[curr.code];
        if (val !== undefined && val !== '') {
          formData.append(`price_${curr.code}`, Number(val));
        }
        const saleVal = multiSalePrices[curr.code];
        if (saleVal !== undefined && saleVal !== '') {
          formData.append(`salePrice_${curr.code}`, Number(saleVal));
        }
      }

      images.forEach(img => formData.append('images', img));

      if (editing) {
        await API.put(`/products/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const toggleActive = async (product) => {
    try {
      await API.put(`/products/${product._id}`, { isActive: !product.isActive });
      toast.success(product.isActive ? 'Product deactivated' : 'Product activated');
      fetchData();
    } catch (err) { toast.error('Failed to update'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Products ({total})</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-44 bg-theme-input text-theme-primary border border-gold/20 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={exportCsv} className="btn-gold-outline text-sm flex items-center gap-2"><FiDownload size={16} /> Export</button>
          <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-2"><FiPlus size={16} /> Add Product</button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="glass-card p-3 mb-4 flex items-center gap-3 flex-wrap border-gold/30">
          <span className="text-sm text-theme-primary font-medium flex items-center gap-2"><FiCheckSquare size={16} className="text-gold" /> {selected.length} selected</span>
          <button onClick={() => handleBulkAction('active', true)} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30">Activate</button>
          <button onClick={() => handleBulkAction('active', false)} className="text-xs px-3 py-1.5 rounded-lg bg-theme-tertiary text-theme-muted hover:text-red-400">Deactivate</button>
          <button onClick={() => handleBulkAction('featured', true)} className="text-xs px-3 py-1.5 rounded-lg bg-gold/20 text-gold hover:bg-gold/30">Mark Featured</button>
          <button onClick={() => handleBulkAction('bestSeller', true)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Best Seller</button>
          <button onClick={() => handleBulkAction('newArrival', true)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30">New Arrival</button>
          <button onClick={() => setShowBulkStock(true)} className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 flex items-center gap-1"><FiBox size={12} /> Set Stock</button>
          <button onClick={() => { if (confirm(`Delete ${selected.length} product(s)?`)) handleBulkAction('delete'); }} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">Delete</button>
          <button onClick={() => setSelected([])} className="text-xs px-3 py-1.5 rounded-lg bg-theme-tertiary text-theme-muted hover:text-gold ml-auto">Clear</button>
        </div>
      )}

      {showBulkStock && (
        <div className="glass-card p-3 mb-4 flex items-center gap-3">
          <label className="text-sm text-theme-secondary">Set stock for {selected.length} product(s):</label>
          <input type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)}
            className="w-32 bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          <button onClick={handleBulkStock} className="btn-gold text-xs">Apply</button>
          <button onClick={() => setShowBulkStock(false)} className="text-xs px-3 py-2 rounded-lg bg-theme-tertiary text-theme-muted">Cancel</button>
        </div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10 text-theme-muted">
              <th className="p-3 text-left w-8">
                <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gold" />
              </th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className={`border-b border-gold/5 hover:bg-theme-tertiary/50 transition-colors ${selected.includes(product._id) ? 'bg-gold/5' : ''}`}>
                <td className="p-3">
                  <input type="checkbox" checked={selected.includes(product._id)} onChange={() => toggleSelect(product._id)} className="w-4 h-4 accent-gold" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gold/10 flex-shrink-0">
                      <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-theme-primary font-medium truncate max-w-[200px]">{product.name}</span>
                  </div>
                </td>
                <td className="p-3 text-theme-secondary">{product.sku}</td>
                <td className="p-3 text-theme-secondary">{product.category?.name || '-'}</td>
                <td className="p-3">
                  <span className="text-gold">{product.salePrice ? `\u20A8${product.salePrice.toLocaleString()}` : `\u20A8${product.price.toLocaleString()}`}</span>
                  {product.salePrice ? <span className="text-theme-muted text-xs line-through ml-2">₨{product.price.toLocaleString()}</span> : null}
                </td>
                <td className="p-3">
                  <span className={product.stock < 5 ? 'text-red-400' : 'text-green-400'}>{product.stock}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <FiStar size={12} className="text-gold" />
                    <span className="text-theme-secondary">{product.rating || 0}</span>
                  </div>
                </td>
                <td className="p-3">
                  <button onClick={() => toggleActive(product)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${product.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-theme-tertiary text-theme-muted hover:text-red-400'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {product.featured && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">F</span>}
                    {product.bestSeller && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">BS</span>}
                    {product.newArrival && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">New</span>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(product)} className="p-2 text-theme-secondary hover:text-gold transition-colors"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(product._id)} className="p-2 text-theme-secondary hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-theme-muted">
            <FiBox size={40} className="mx-auto mb-3 text-gold/40" />
            <p className="text-sm">No products found</p>
            <p className="text-xs mt-1">Try adjusting search or filters</p>
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-theme-secondary border border-gold/20 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-theme-primary font-bold mb-6">{editing ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-theme-muted block mb-2">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-theme-muted block mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold h-24" required />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-theme-muted block mb-2">Short Description</label>
                <input type="text" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Price (PKR)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" required />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Sale Price (PKR)</label>
                <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>

              <div className="sm:col-span-2 border-t border-gold/10 pt-4 mt-2">
                <h3 className="text-sm font-semibold text-gold mb-3">International Prices (optional - override default conversion)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CURRENCIES.filter(c => c.code !== 'PKR').map(curr => (
                    <div key={curr.code} className="border border-gold/10 rounded-lg p-2">
                      <label className="text-xs text-theme-muted block mb-1">{curr.symbol} {curr.label}</label>
                      <input type="number" value={multiPrices[curr.code] || ''}
                        onChange={(e) => setMultiPrices({ ...multiPrices, [curr.code]: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder={`Price in ${curr.code}`}
                        className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gold" />
                      <input type="number" value={multiSalePrices[curr.code] || ''}
                        onChange={(e) => setMultiSalePrices({ ...multiSalePrices, [curr.code]: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Sale price (optional)"
                        className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gold mt-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-theme-muted block mb-2">SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" required />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" required>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" required />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Material</label>
                <input type="text" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Color</label>
                <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Dimensions</label>
                <input type="text" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Weight</label>
                <input type="text" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-theme-muted block mb-2">Images</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange}
                  className="w-full bg-theme-input text-theme-secondary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-gold file:text-dark file:font-semibold hover:file:bg-gold-dark" />
                {(() => {
                  const allPreviews = [...existingImages, ...newImagePreviews];
                  return allPreviews.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {allPreviews.map((preview, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gold/20 group">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                          {i < existingImages.length ? (
                            <button type="button" onClick={() => handleRemoveExistingImage(i)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs">Delete</button>
                          ) : (
                            <button type="button" onClick={() => removeNewImage(i - existingImages.length)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs">Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="flex items-center gap-4 sm:col-span-2">
                {['featured', 'bestSeller', 'newArrival'].map(field => (
                  <label key={field} className="flex items-center gap-2 text-sm text-theme-secondary cursor-pointer">
                    <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })}
                      className="w-4 h-4 accent-gold" />
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </label>
                ))}
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button type="submit" className="btn-gold text-sm flex-1">{editing ? 'Update' : 'Create'} Product</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-gold-outline text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
