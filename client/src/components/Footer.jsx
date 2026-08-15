import { Link } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`footer border-t border-gold/10 pt-16 pb-8 transition-colors duration-300 ${isDark ? 'bg-dark-600' : 'bg-[#E5E1DB]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
                <div className="w-2 h-4 bg-gold rounded-full transform rotate-12"></div>
              </div>
              <span className="font-serif text-xl font-bold text-gold-light">UniPrime</span>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Crafting timeless elegance for your walls. Every clock tells a story of precision and luxury.</p>
          </div>

          <div>
            <h4 className="font-serif text-gold-light font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>Home</Link></li>
              <li><Link to="/products" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>Collections</Link></li>
              <li><Link to="/products?bestSeller=true" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>Best Sellers</Link></li>
              <li><Link to="/about" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-gold-light font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>FAQ</Link></li>
              <li><Link to="/contact" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>Contact Us</Link></li>
              <li><Link to="/terms-and-conditions" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className={`${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gold text-sm transition-colors`}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-gold-light font-semibold mb-4">Contact</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>support@uniprimeclocks.com</li>
              <li>03198308858</li>
              <li>Karachi, Pakistan</li>
              <li className="text-gold text-xs">Mon-Sat: 10 AM - 8 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>&copy; {new Date().getFullYear()} UniPrime Wall Clocks. All rights reserved.</p>
          <div className={`flex gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
