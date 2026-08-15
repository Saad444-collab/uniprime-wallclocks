import { Link } from 'react-router';
import { FiClock } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function NotFound() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <Seo title="Page Not Found" description="The page you are looking for does not exist." />
      <div className="text-center">
        <FiClock size={64} className="text-gold mx-auto mb-4" />
        <h1 className={`font-serif text-5xl sm:text-6xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>404</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-lg mb-2`}>Page not found</p>
        <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm mb-8`}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-gold">Back to Home</Link>
      </div>
    </div>
  );
}
