import { Link, useLocation } from 'react-router';
import { FiHome, FiPackage, FiShoppingBag, FiUsers, FiGrid, FiStar, FiLogOut, FiDollarSign, FiSun, FiMoon, FiTag, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../utils/api';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      API.get('/contact/unread-count')
        .then(res => { if (active) setUnreadCount(res.data.data?.unreadCount || 0); })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 60000);
    return () => { active = false; clearInterval(t); };
  }, []);

  const links = [
    { to: '/admin', label: 'Dashboard', icon: FiHome },
    { to: '/admin/products', label: 'Products', icon: FiPackage },
    { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/categories', label: 'Categories', icon: FiGrid },
    { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
    { to: '/admin/payments', label: 'Payments', icon: FiDollarSign },
    { to: '/admin/payment-settings', label: 'Payment Settings', icon: FiDollarSign },
    { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
    { to: '/admin/contact', label: 'Messages', icon: FiMail },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-theme-primary text-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="glass-card p-4 sticky top-24">
              <div className="text-center mb-4 pb-4 border-b border-gold/10">
                <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-2">
                  <div className="w-2 h-4 bg-gold rounded-full transform rotate-12"></div>
                </div>
                <h3 className="text-theme-primary font-semibold text-sm">Admin Panel</h3>
                <p className="text-xs text-theme-muted">UniPrime Clocks</p>
              </div>
              <nav className="space-y-1">
                {links.map(link => {
                  const active = location.pathname === link.to;
                  return (
                    <Link key={link.to} to={link.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        active ? 'bg-gold/10 text-gold border border-gold/20' : 'text-theme-secondary hover:text-gold hover:bg-theme-tertiary'
                      }`}>
                      <link.icon size={16} />
                      <span className="flex-1">{link.label}</span>
                      {link.to === '/admin/contact' && unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{unreadCount}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-gold/10 mt-4 pt-4 space-y-1">
                <button onClick={toggleTheme}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-theme-secondary hover:text-gold hover:bg-theme-tertiary w-full transition-all">
                  {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-theme-tertiary w-full transition-all">
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile tabs */}
            <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
              {links.map(link => {
                const active = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      active ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary border border-gold/10'
                    }`}>
                    <link.icon size={14} />
                    {link.label}
                    {link.to === '/admin/contact' && unreadCount > 0 && (
                      <span className="px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{unreadCount}</span>
                    )}
                  </Link>
                );
              })}
              <button onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap bg-theme-tertiary text-theme-secondary border border-gold/10 transition-all">
                {theme === 'dark' ? <FiSun size={14} /> : <FiMoon size={14} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
