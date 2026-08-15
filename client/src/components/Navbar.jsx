import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiMenu, FiX, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import CurrencySelector from './CurrencySelector';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <nav className={`navbar fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${isDark ? 'bg-dark-500/90 border-gold/10' : 'bg-white/90 border-gold/15'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gold flex items-center justify-center">
              <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-gold rounded-full transform rotate-12"></div>
            </div>
            <span className="font-serif text-lg sm:text-xl font-bold text-gold-light tracking-wider">UniPrime</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors text-sm tracking-wider uppercase`}>Home</Link>
            <Link to="/products" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors text-sm tracking-wider uppercase`}>Collections</Link>
            <Link to="/products?category=" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors text-sm tracking-wider uppercase`}>Shop</Link>
            {isAdmin && (
              <Link to="/admin" className="text-gold hover:text-gold-light transition-colors text-sm tracking-wider uppercase">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors`}>
              <FiSearch size={18} />
            </button>
            <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            <CurrencySelector />
            <Link to="/wishlist" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors relative`}>
              <FiHeart size={18} />
            </Link>
            <Link to="/cart" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors relative`}>
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-dark text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-gold-light transition-colors`}>
                  <FiUser size={18} />
                </button>
                <div className={`absolute right-0 mt-2 w-48 border border-gold/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 ${isDark ? 'bg-dark-400' : 'bg-white'}`}>
                  <div className={`px-4 py-2 border-b ${isDark ? 'border-gold/10' : 'border-gray-100'}`}>
                    <p className={`text-sm text-gold-light font-medium truncate`}>{user.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  </div>
                  <Link to="/profile" className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-dark-300' : 'text-gray-600 hover:bg-gray-50'} hover:text-gold-light`}>Profile</Link>
                  <Link to="/cart" className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-dark-300' : 'text-gray-600 hover:bg-gray-50'} hover:text-gold-light`}>My Cart</Link>
                  {isAdmin && (
                    <Link to="/admin" className={`block px-4 py-2 text-sm text-gold ${isDark ? 'hover:bg-dark-300' : 'hover:bg-gray-50'}`}>Dashboard</Link>
                  )}
                  <button onClick={logout} className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 ${isDark ? 'hover:bg-dark-300' : 'hover:bg-gray-50'}`}>
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-gold text-xs sm:text-sm py-2 px-4 sm:px-6">Sign In</Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden hover:text-gold-light transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className={`border-t py-4 transition-colors duration-300 ${isDark ? 'bg-dark-400 border-gold/10' : 'bg-white border-gray-100'}`}>
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto px-4 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search luxury wall clocks..."
              className={`flex-1 border border-gold/20 rounded-full px-6 py-3 focus:outline-none focus:border-gold text-sm transition-colors ${isDark ? 'bg-dark-300 text-white' : 'bg-gray-100 text-gray-900'}`}
            />
            <button type="submit" className="btn-gold text-sm py-3">Search</button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className={`md:hidden border-t transition-colors duration-300 ${isDark ? 'bg-dark-400 border-gold/10' : 'bg-white border-gray-100'}`}>
          <div className="px-4 py-4 space-y-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className={`block hover:text-gold-light py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className={`block hover:text-gold-light py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Collections</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className={`block hover:text-gold-light py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Wishlist</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-gold py-2">Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
