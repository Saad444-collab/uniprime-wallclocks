import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiEye, FiSearch, FiX, FiDownload, FiCheckSquare } from 'react-icons/fi';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchOrders();
    }, search ? 300 : 0);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [filter, page, search]);

  const fetchOrders = async () => {
    try {
      const params = { limit: PAGE_SIZE, page };
      if (filter) params.status = filter;
      if (search.trim()) params.search = search.trim();
      const res = await API.get('/orders', { params });
      setOrders(res.data.data?.orders || []);
      setTotal(res.data.data?.total || 0);
      setPages(res.data.data?.pages || 1);
    } catch (err) { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selected.length === orders.length) setSelected([]);
    else setSelected(orders.map(o => o._id));
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus) { toast.error('Choose a status first'); return; }
    if (selected.length === 0) { toast.error('Select orders first'); return; }
    if (!window.confirm(`Mark ${selected.length} order(s) as ${bulkStatus}?`)) return;
    try {
      await API.post('/orders/bulk-status', { ids: selected, orderStatus: bulkStatus });
      toast.success(`Updated ${selected.length} order(s)`);
      setSelected([]);
      setBulkStatus('');
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk update failed'); }
  };

  const updateStatus = async (id, status) => {
    const isCancelled = status === 'cancelled';
    if (!window.confirm(`Mark this order as ${status}?`)) return;
    try {
      await API.put(`/orders/${id}/status`, { orderStatus: status });
      toast.success(`Order ${status}`);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const markPaid = async (id) => {
    if (!window.confirm('Mark this order as paid?')) return;
    try {
      await API.put(`/orders/${id}/pay`);
      toast.success('Order marked as paid');
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const exportCSV = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await API.get('/orders/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Orders exported');
    } catch (err) { toast.error('Failed to export orders'); }
  };

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-purple-500/20 text-purple-400',
    shipped: 'bg-indigo-500/20 text-indigo-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  const filtered = orders.filter(order =>
    !payFilter || order.paymentStatus === payFilter
  );

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Orders ({total})</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10 text-sm transition-colors">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, email..."
            className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold" />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === s ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10'
              }`}>
              {s || 'All status'}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="glass-card p-3 mb-4 flex items-center gap-3 flex-wrap border-gold/30">
          <span className="text-sm text-theme-primary font-medium flex items-center gap-2"><FiCheckSquare size={16} className="text-gold" /> {selected.length} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold">
            <option value="">Set status...</option>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={applyBulkStatus} className="btn-gold text-xs">Apply</button>
          <button onClick={() => setSelected([])} className="text-xs px-3 py-1.5 rounded-lg bg-theme-tertiary text-theme-muted hover:text-gold ml-auto">Clear</button>
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap mb-6">
        <span className="text-xs text-theme-muted self-center mr-1">Payment:</span>
        {['', 'pending', 'paid', 'rejected'].map(s => (
          <button key={s} onClick={() => setPayFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              payFilter === s ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10 text-theme-muted">
              <th className="p-3 text-left w-8">
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gold" />
              </th>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" className="p-8 text-center text-theme-muted">No orders found</td></tr>
            ) : filtered.map(order => (
              <tr key={order._id} className={`border-b border-gold/5 hover:bg-theme-tertiary/50 ${selected.includes(order._id) ? 'bg-gold/5' : ''}`}>
                <td className="p-3">
                  <input type="checkbox" checked={selected.includes(order._id)} onChange={() => toggleSelect(order._id)} className="w-4 h-4 accent-gold" />
                </td>
                <td className="p-3 text-gold font-medium">{order.orderNumber}</td>
                <td className="p-3 text-theme-secondary">{order.user?.name || order.user?.email || 'N/A'}</td>
                <td className="p-3 text-theme-secondary">{order.items?.length}</td>
                <td className="p-3 text-gold">{order.currencySymbol || '\u20A8'}{order.totalAmount?.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                    order.paymentStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{order.paymentStatus}</span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.orderStatus] || ''}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-3 text-theme-secondary text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-1 items-center">
                    <button onClick={() => setSelectedOrder(order)}
                      className="p-2 text-theme-secondary hover:text-gold transition-colors" title="View details">
                      <FiEye size={15} />
                    </button>
                    {order.paymentStatus !== 'paid' && order.paymentMethod !== 'easypaisa' && (
                      <button onClick={() => markPaid(order._id)}
                        className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20">
                        Mark Paid
                      </button>
                    )}
                    {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                      <>
                        {['confirmed', 'processing', 'shipped', 'delivered'].map(s => (
                          <button key={s} onClick={() => updateStatus(order._id, s)}
                            className="text-xs px-2 py-1 rounded bg-theme-tertiary text-theme-secondary hover:text-gold hover:bg-theme-secondary transition-colors">
                            {s}
                          </button>
                        ))}
                        <button onClick={() => updateStatus(order._id, 'cancelled')}
                          className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedOrder(null)}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-theme-secondary border border-gold/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-theme-primary font-bold">
                {selectedOrder.orderNumber}{' '}
                <span className={`text-xs px-3 py-1 rounded-full ml-2 align-middle ${statusColors[selectedOrder.orderStatus] || ''}`}>
                  {selectedOrder.orderStatus}
                </span>
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-theme-secondary hover:text-red-400"><FiX size={20} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xs font-semibold text-gold mb-2">Customer</h3>
                <p className="text-theme-primary text-sm">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-theme-secondary text-xs">{selectedOrder.user?.email || '-'}</p>
                <p className="text-theme-secondary text-xs">{selectedOrder.shippingAddress?.phone || '-'}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gold mb-2">Shipping Address</h3>
                <p className="text-theme-secondary text-sm">
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                  {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}<br />
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-gold/5 pb-2">
                  {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gold/10" />}
                  <div className="flex-1">
                    <p className="text-theme-primary text-sm">{item.name}</p>
                    <p className="text-theme-muted text-xs">Qty: {item.quantity} x {selectedOrder.currencySymbol || '\u20A8'}{item.price?.toLocaleString()}</p>
                  </div>
                  <span className="text-gold text-sm">{selectedOrder.currencySymbol || '\u20A8'}{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-sm border-t border-gold/10 pt-4">
              <div className="flex justify-between text-theme-secondary"><span>Subtotal</span><span>{selectedOrder.currencySymbol || '\u20A8'}{selectedOrder.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-theme-secondary"><span>Shipping</span><span>{selectedOrder.currencySymbol || '\u20A8'}{selectedOrder.shippingCost?.toLocaleString()}</span></div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-green-400"><span>Discount{selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ''}</span><span>-{selectedOrder.currencySymbol || '\u20A8'}{selectedOrder.discount?.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between font-semibold text-theme-primary text-base pt-2"><span>Total</span><span>{selectedOrder.currencySymbol || '\u20A8'}{selectedOrder.totalAmount?.toLocaleString()}</span></div>
              <div className="flex justify-between text-theme-muted pt-2">
                <span>Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
