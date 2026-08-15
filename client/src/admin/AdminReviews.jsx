import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiStar, FiCheck, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImage, setShowImage] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchReviews();
    }, search ? 300 : 0);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [page, search, filter]);

  const fetchReviews = async () => {
    try {
      const params = { limit: PAGE_SIZE, page };
      if (search.trim()) params.search = search.trim();
      if (filter) params.status = filter;
      const res = await API.get('/reviews', { params });
      setReviews(res.data.data?.reviews || []);
      setTotal(res.data.data?.total || 0);
      setPages(res.data.data?.pages || 1);
    } catch (err) { toast.error('Failed to load reviews'); }
    setLoading(false);
  };

  const toggleApprove = async (id) => {
    try {
      await API.put(`/reviews/${id}/approve`);
      toast.success('Review updated');
      setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: !r.isApproved } : r));
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Reviews ({total})</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-56 bg-theme-input text-theme-primary border border-gold/20 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div className="flex gap-1.5">
            {['', 'pending', 'approved'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === s ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10'
                }`}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="glass-card text-center text-theme-muted py-8">No reviews found</div>
        ) : reviews.map(review => (
          <div key={review._id} className="glass-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-theme-primary font-medium text-sm">{review.user?.name || 'Anonymous'}</span>
                  <span className="text-xs text-theme-muted">on</span>
                  <span className="text-gold text-sm">{review.product?.name || 'Product'}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={12} className={i < review.rating ? 'text-gold fill-current' : 'text-theme-muted'} />
                    ))}
                  </div>
                  {!review.isApproved && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>
                  )}
                </div>
                <p className="text-theme-secondary text-sm">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {review.images.map((img, i) => (
                      <button key={i} onClick={() => setShowImage(img)}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-gold/10 hover:border-gold/40 transition-colors">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-theme-muted mt-2">{new Date(review.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => toggleApprove(review._id)}
                  className={`p-2 rounded-lg transition-colors ${review.isApproved ? 'text-green-400 bg-green-500/10' : 'text-theme-secondary bg-theme-tertiary hover:text-gold'}`}
                  title={review.isApproved ? 'Unapprove' : 'Approve'}>
                  <FiCheck size={16} />
                </button>
                <button onClick={() => handleDelete(review._id)}
                  className="p-2 rounded-lg text-theme-secondary bg-theme-tertiary hover:text-red-400 transition-colors">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {showImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowImage(null)}>
          <div className="relative max-w-2xl w-full">
            <img src={showImage} alt="Review" className="w-full rounded-2xl" />
            <button onClick={() => setShowImage(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg text-sm font-bold">×</button>
          </div>
        </div>
      )}
    </div>
  );
}