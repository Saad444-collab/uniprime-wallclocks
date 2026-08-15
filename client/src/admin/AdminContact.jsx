import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiMail, FiTrash2, FiCheck, FiX, FiEye, FiRefreshCw, FiInbox, FiCheckCircle } from 'react-icons/fi';

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchMessages = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await API.get('/contact', { params });
      setMessages(res.data.data?.messages || []);
      setTotal(res.data.data?.total || 0);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch (err) { toast.error('Failed to load messages'); }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [filter]);

  const markRead = async (msg) => {
    if (msg.isRead) return;
    try {
      await API.put(`/contact/${msg._id}/read`);
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      setUnreadCount(c => Math.max(0, c - 1));
      if (selected?._id === msg._id) setSelected({ ...msg, isRead: true });
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await API.delete(`/contact/${id}`);
      toast.success('Message deleted');
      if (selected?._id === id) setSelected(null);
      fetchMessages();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Messages ({total})</h1>
        <button onClick={() => { setLoading(true); fetchMessages(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10 text-sm transition-colors">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'unread', 'read'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === s ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10'
            }`}>
            {s === '' ? <FiInbox size={13} /> : s === 'unread' ? <FiMail size={13} /> : <FiCheckCircle size={13} />}
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'unread' && unreadCount > 0 && (
              <span className={`px-1.5 rounded-full text-[10px] ${filter === 'unread' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {messages.length === 0 ? (
          <div className="glass-card text-center text-theme-muted py-12 lg:col-span-2">No messages found</div>
        ) : messages.map(msg => (
          <motion.div key={msg._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`glass-card cursor-pointer transition-all ${msg.isRead ? '' : 'border-gold/30'}`}
            onClick={() => { setSelected(msg); markRead(msg); }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isRead && <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0"></span>}
                  <span className="text-theme-primary font-medium text-sm truncate">{msg.name}</span>
                  <span className="text-xs text-theme-muted truncate">{msg.email}</span>
                </div>
                {msg.subject && <p className="text-gold text-xs font-medium mb-1 truncate">{msg.subject}</p>}
                <p className="text-theme-secondary text-sm line-clamp-3">{msg.message}</p>
                <p className="text-xs text-theme-muted mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); markRead(msg); }}
                  className={`p-2 rounded-lg transition-colors ${msg.isRead ? 'text-green-400 bg-green-500/10' : 'text-theme-secondary bg-theme-tertiary hover:text-gold'}`}
                  title={msg.isRead ? 'Read' : 'Mark as read'}>
                  <FiCheck size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                  className="p-2 rounded-lg text-theme-secondary bg-theme-tertiary hover:text-red-400 transition-colors" title="Delete">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-theme-secondary border border-gold/20 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-theme-primary font-bold">Message</h2>
              <button onClick={() => setSelected(null)} className="text-theme-secondary hover:text-red-400"><FiX size={20} /></button>
            </div>
            <div className="mb-5">
              <p className="text-theme-primary font-medium">{selected.name} <span className="text-theme-muted text-sm font-normal">({selected.email})</span></p>
              {selected.subject && <p className="text-gold text-sm mt-1">{selected.subject}</p>}
              <p className="text-xs text-theme-muted mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            <div className="bg-theme-input border border-gold/10 rounded-xl p-4 mb-5">
              <p className="text-theme-secondary text-sm whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="flex items-center gap-2 text-xs mb-4">
              <FiMail size={13} className={selected.isRead ? 'text-green-400' : 'text-gold'} />
              <a href={`mailto:${selected.email}`} className="text-gold hover:text-gold-light underline">{selected.isRead ? 'Read' : 'Unread'} - Reply by email</a>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelected(null); handleDelete(selected._id); }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-medium transition-colors">
                Delete Message
              </button>
              <button onClick={() => setSelected(null)} className="btn-gold-outline text-sm">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}