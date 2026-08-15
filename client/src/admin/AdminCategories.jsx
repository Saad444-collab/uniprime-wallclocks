import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) { toast.error('Failed to load'); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', image: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat._id);
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await API.post('/categories', form);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Categories ({categories.length})</h1>
        <button onClick={openCreate} className="btn-gold text-sm flex items-center gap-2"><FiPlus size={16} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <motion.div key={cat._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex items-center justify-between">
            <div>
              <h3 className="text-theme-primary font-medium">{cat.name}</h3>
              <p className="text-xs text-theme-muted mt-1">{cat.description || 'No description'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="p-2 text-theme-secondary hover:text-gold"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(cat._id)} className="p-2 text-theme-secondary hover:text-red-400"><FiTrash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-theme-secondary border border-gold/20 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-theme-primary font-bold mb-6">{editing ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-theme-muted block mb-2">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" required />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-theme-muted block mb-2">Image URL</label>
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-theme-input text-theme-primary border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
              {form.image && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gold/20">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" className="btn-gold text-sm flex-1">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-gold-outline text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
