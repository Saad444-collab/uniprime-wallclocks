import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiShield, FiCheckCircle, FiSearch, FiDownload, FiCheckSquare } from 'react-icons/fi';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 15;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchUsers();
    }, search ? 300 : 0);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      const params = { limit: PAGE_SIZE, page };
      if (search.trim()) params.search = search.trim();
      const res = await API.get('/users', { params });
      setUsers(res.data.data?.users || []);
      setTotal(res.data.data?.total || 0);
      setPages(res.data.data?.pages || 1);
    } catch (err) { toast.error('Failed to load users'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u._id !== id));
    } catch (err) { toast.error('Failed to delete'); }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      await API.put(`/users/${user._id}`, { role: newRole });
      toast.success(`User is now ${newRole}`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update role'); }
  };

  const toggleVerify = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { isVerified: !user.isVerified });
      toast.success('Verification updated');
      fetchUsers();
    } catch (err) { toast.error('Failed to update verification'); }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map(u => u._id));
  };

  const bulkDelete = async () => {
    if (selected.length === 0) { toast.error('Select users first'); return; }
    if (!confirm(`Delete ${selected.length} user(s)?`)) return;
    try {
      await API.post('/users/bulk-delete', { ids: selected });
      toast.success(`Deleted ${selected.length} user(s)`);
      setSelected([]);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Bulk delete failed'); }
  };

  const exportCsv = async () => {
    try {
      const res = await API.get('/users/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Users exported');
    } catch (err) { toast.error('Export failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="clock-loader"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Users ({total})</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-56 bg-theme-input text-theme-primary border border-gold/20 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <button onClick={exportCsv} className="btn-gold-outline text-sm flex items-center gap-2"><FiDownload size={16} /> Export</button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="glass-card p-3 mb-4 flex items-center gap-3 flex-wrap border-gold/30">
          <span className="text-sm text-theme-primary font-medium flex items-center gap-2"><FiCheckSquare size={16} className="text-gold" /> {selected.length} selected</span>
          <button onClick={bulkDelete} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">Delete Selected</button>
          <button onClick={() => setSelected([])} className="text-xs px-3 py-1.5 rounded-lg bg-theme-tertiary text-theme-muted hover:text-gold ml-auto">Clear</button>
        </div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10 text-theme-muted">
              <th className="p-3 text-left w-8">
                <input type="checkbox" checked={selected.length === users.length && users.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-gold" />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Verified</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-theme-muted">No users found</td></tr>
            ) : users.map(user => (
              <tr key={user._id} className={`border-b border-gold/5 hover:bg-theme-tertiary/50 ${selected.includes(user._id) ? 'bg-gold/5' : ''}`}>
                <td className="p-3">
                  <input type="checkbox" checked={selected.includes(user._id)} onChange={() => toggleSelect(user._id)} className="w-4 h-4 accent-gold" />
                </td>
                <td className="p-3 text-theme-primary font-medium">{user.name}</td>
                <td className="p-3 text-theme-secondary">{user.email}</td>
                <td className="p-3 text-theme-secondary">{user.phone || '-'}</td>
                <td className="p-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-theme-tertiary text-theme-secondary'
                  }`}>{user.role}</span>
                </td>
                <td className="p-3">
                  <span className={`text-xs ${user.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                    {user.isVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-3 text-theme-secondary text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleVerify(user)}
                      className="p-2 rounded-lg bg-theme-tertiary hover:bg-theme-secondary transition-colors"
                      title={user.isVerified ? 'Unverify email' : 'Verify email'}>
                      <FiCheckCircle size={14} className={user.isVerified ? 'text-green-400' : 'text-theme-secondary hover:text-green-400'} />
                    </button>
                    <button onClick={() => toggleRole(user)}
                      className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-theme-tertiary text-theme-secondary hover:text-gold'}`}
                      title={user.role === 'admin' ? 'Demote to customer' : 'Make admin'}>
                      <FiShield size={14} />
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="p-2 text-theme-secondary hover:text-red-400 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
