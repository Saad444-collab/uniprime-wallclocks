import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import API from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiAlertCircle, FiClock, FiCheckCircle, FiRefreshCw, FiMail, FiBox, FiCreditCard, FiTrendingUp } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function AdminDashboard() {
  const { theme } = useTheme();
  const { formatPrice } = useCurrency();
  const isLight = theme === 'light';

  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStock: 0,
    unreadMessages: 0,
    periodOrders: 0,
    periodRevenue: 0,
    periodUnits: 0,
    periodAvgOrderValue: 0,
    paymentMethods: {}
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donutData, setDonutData] = useState({
    labels: ['Delivered', 'Pending', 'Processing', 'Shipped', 'Cancelled'],
    datasets: [{ data: [0], backgroundColor: ['#10B981'], borderWidth: 0 }]
  });
  const [paymentData, setPaymentData] = useState({
    labels: [], datasets: [{ data: [], backgroundColor: ['#D4A843', '#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'], borderWidth: 0 }]
  });
  const [barData, setBarData] = useState({
    labels: [], datasets: [{ label: 'Sales', data: [], backgroundColor: '#D4A843', borderRadius: 8 }]
  });
  const [lineData, setLineData] = useState({
    labels: [], datasets: [{ label: 'Monthly Revenue', data: [], borderColor: '#D4A843', backgroundColor: 'rgba(212, 168, 67, 0.1)', fill: true, tension: 0.4 }]
  });

  const tickColor = isLight ? '#6B7280' : '#666';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsRes, recentRes, contactRes] = await Promise.all([
        API.get('/orders/stats', { params: { period } }),
        API.get('/orders?limit=5'),
        API.get('/contact/unread-count')
      ]);
      const stats = statsRes.data.data;
      const statusCounts = stats.statusCounts || {};
      const recentOrders = recentRes.data.data?.orders || [];
      const unreadMessages = contactRes.data.data?.unreadCount || 0;

      setStats({
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalCustomers: stats.totalCustomers || 0,
        totalProducts: stats.totalProducts || 0,
        pendingOrders: stats.pendingOrders || 0,
        lowStock: stats.lowStock || 0,
        unreadMessages,
        periodOrders: stats.periodOrders || 0,
        periodRevenue: stats.periodRevenue || 0,
        periodUnits: stats.periodUnits || 0,
        periodAvgOrderValue: stats.periodAvgOrderValue || 0,
        paymentMethods: stats.paymentMethods || {}
      });
      setRecentOrders(recentOrders.slice(0, 5));
      setTopProducts((stats.topProducts || []).map(p => ({ name: p._id, qty: p.qty })));

      const statusOrder = ['delivered', 'pending', 'processing', 'shipped', 'cancelled'];
      setDonutData({
        labels: statusOrder.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{ data: statusOrder.map(s => statusCounts[s] || 0), backgroundColor: ['#10B981', '#D4A843', '#6366F1', '#3B82F6', '#EF4444'], borderWidth: 0 }]
      });

      const pm = stats.paymentMethods || {};
      const pmKeys = Object.keys(pm);
      setPaymentData({
        labels: pmKeys.map(k => k.toUpperCase()),
        datasets: [{ data: pmKeys.map(k => pm[k].orders || 0), backgroundColor: ['#D4A843', '#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'], borderWidth: 0 }]
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daySales = [0, 0, 0, 0, 0, 0, 0];
      const weekKey = {};
      (stats.weeklyRevenue || []).forEach(r => {
        weekKey[`${r._id.y}-${r._id.m}-${r._id.d}`] = r.revenue;
      });
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        if (weekKey[k] !== undefined) {
          daySales[d.getDay()] += weekKey[k];
        }
      }
      setBarData({
        labels: dayNames,
        datasets: [{ label: 'Sales', data: daySales, backgroundColor: '#D4A843', borderRadius: 8 }]
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
      }
      const key = (y, m) => `${y}-${m}`;
      const revenueByKey = {};
      (stats.monthlyRevenue || []).forEach(r => {
        revenueByKey[key(r._id.y, r._id.m)] = r.revenue;
      });
      setLineData({
        labels: months.map(m => monthNames[m.month]),
        datasets: [{
          label: 'Monthly Revenue',
          data: months.map(m => Math.round((revenueByKey[key(m.year, m.month)] || 0) * 100) / 100),
          borderColor: '#D4A843',
          backgroundColor: 'rgba(212, 168, 67, 0.1)',
          fill: true,
          tension: 0.4
        }]
      });
    } catch (err) { /* ignore */ }
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const PERIODS = [
    { key: 'today', label: 'Today' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="clock-loader"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-theme-primary">Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-theme-tertiary border border-gold/10 rounded-lg p-1">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p.key ? 'bg-gold text-dark' : 'text-theme-secondary hover:text-gold'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={() => { setLoading(true); fetchDashboard(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-gold border border-gold/10 text-sm transition-colors">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { icon: FiDollarSign, label: 'Period Revenue', value: formatPrice(stats.periodRevenue), color: 'text-green-400' },
          { icon: FiShoppingBag, label: 'Period Orders', value: stats.periodOrders.toString(), color: 'text-blue-400' },
          { icon: FiBox, label: 'Units Sold', value: stats.periodUnits.toString(), color: 'text-purple-400' },
          { icon: FiTrendingUp, label: 'Avg Order Value', value: formatPrice(stats.periodAvgOrderValue), color: 'text-gold' },
          { icon: FiUsers, label: 'Customers', value: stats.totalCustomers.toString(), color: 'text-indigo-400' },
          { icon: FiPackage, label: 'Products', value: stats.totalProducts.toString(), color: 'text-cyan-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card text-center">
            <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-theme-primary">{stat.value}</div>
            <div className="text-xs text-theme-muted mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiShoppingBag, label: 'Total Orders', value: stats.totalOrders.toString(), color: 'text-blue-400' },
          { icon: FiDollarSign, label: 'Total Revenue', value: formatPrice(stats.totalRevenue), color: 'text-green-400' },
          { icon: FiClock, label: 'Pending', value: stats.pendingOrders.toString(), color: 'text-orange-400' },
          { icon: FiAlertCircle, label: 'Low Stock', value: stats.lowStock.toString(), color: 'text-red-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card text-center">
            <stat.icon size={22} className={`mx-auto mb-2 ${stat.color}`} />
            <div className="text-xl font-bold text-theme-primary">{stat.value}</div>
            <div className="text-xs text-theme-muted mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Weekly Sales</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false }, ticks: { color: tickColor } },
              y: { grid: { color: gridColor }, ticks: { color: tickColor } } } }} />
        </div>
        <div className="glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Revenue Trend</h3>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false }, ticks: { color: tickColor } },
              y: { grid: { color: gridColor }, ticks: { color: tickColor } } } }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Order Status</h3>
          <div className="max-w-[200px] mx-auto">
            <Doughnut data={donutData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: isLight ? '#4B5563' : '#999', padding: 12 } } } }} />
          </div>
        </div>
        <div className="glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Payment Methods ({period.toUpperCase()})</h3>
          <div className="max-w-[200px] mx-auto">
            <Doughnut data={paymentData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: isLight ? '#4B5563' : '#999', padding: 12 } } } }} />
          </div>
        </div>
        <div className="lg:col-span-1 glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between border-b border-gold/5 pb-3">
                <div>
                  <p className="text-theme-primary text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-theme-muted">{order.currencySymbol || '\u20A8'}{order.totalAmount?.toLocaleString()} • {order.items?.length} items</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                  order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  order.orderStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>{order.orderStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-theme-muted py-4">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gold/5 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center font-medium">{i + 1}</span>
                    <span className="text-theme-primary text-sm">{p.name}</span>
                  </div>
                  <span className="text-xs text-theme-muted">{p.qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass-card">
          <h3 className="text-theme-primary font-semibold mb-4">Low Stock</h3>
          {stats.lowStock === 0 ? (
            <p className="text-sm text-theme-muted py-4">All products sufficiently stocked</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map(p => (
                  <div key={p._id} className="flex items-center justify-between border-b border-gold/5 pb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-theme-primary text-sm truncate">{p.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${p.stock <= 0 ? 'text-red-400' : 'text-orange-400'}`}>{p.stock} left</span>
                  </div>
                ))
              ) : null}
              <Link to="/admin/products" className="flex items-center gap-3 text-sm text-gold hover:text-gold-light pt-1">
                <FiPackage size={16} /> View all {stats.lowStock} low stock product(s)
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
        {[
          { to: '/admin/products', label: 'Products', icon: FiPackage },
          { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
          { to: '/admin/users', label: 'Users', icon: FiUsers },
          { to: '/admin/categories', label: 'Categories', icon: FiCheckCircle },
          { to: '/admin/reviews', label: 'Reviews', icon: FiAlertCircle },
          { to: '/admin/contact', label: 'Messages', icon: FiMail },
        ].map(link => (
          <Link key={link.to} to={link.to} className="glass-card text-center hover:border-gold/30 transition-all">
            <link.icon size={24} className="mx-auto mb-2 text-gold" />
            <span className="text-sm text-theme-secondary">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
