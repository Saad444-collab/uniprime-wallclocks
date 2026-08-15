import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { FiGlobe } from 'react-icons/fi';

const OPTIONS = [
  { country: 'PK', currency: 'PKR', label: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}' },
  { country: 'US', currency: 'USD', label: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { country: 'GB', currency: 'GBP', label: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
  { country: 'EU', currency: 'EUR', label: 'Europe', flag: '\u{1F1EA}\u{1F1FA}' },
  { country: 'CA', currency: 'CAD', label: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
  { country: 'AU', currency: 'AUD', label: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
  { country: 'AE', currency: 'AED', label: 'UAE', flag: '\u{1F1E6}\u{1F1EA}' },
  { country: 'SA', currency: 'SAR', label: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}' },
];

const SYMBOLS = { PKR: '₨', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', AED: 'د.إ', SAR: '﷼' };

export default function CurrencySelector() {
  const { currency, countryCode, switchCurrency, flag } = useCurrency();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentOption = OPTIONS.find(o => o.currency === currency) || OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors border ${
          isDark
            ? 'border-gold/20 text-gray-300 hover:border-gold/40 hover:text-gold'
            : 'border-gold/15 text-gray-600 hover:border-gold/30 hover:text-gold'
        }`}
        title="Change currency"
      >
        <FiGlobe size={14} />
        <span className="hidden sm:inline">{flag || currentOption.flag} {currency}</span>
        <span className="sm:hidden">{flag || currentOption.flag}</span>
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-56 border border-gold/20 rounded-xl shadow-2xl z-50 py-2 max-h-80 overflow-y-auto ${
          isDark ? 'bg-dark-400' : 'bg-white'
        }`}>
          <div className={`px-4 py-2 text-xs font-medium uppercase tracking-wider border-b ${
            isDark ? 'text-gray-500 border-gold/10' : 'text-gray-400 border-gray-100'
          }`}>
            Select Currency
          </div>
          {OPTIONS.map(opt => (
            <button
              key={opt.currency}
              onClick={() => {
                switchCurrency(opt.currency, opt.country === 'EU' ? 'DE' : opt.country);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                currency === opt.currency
                  ? 'bg-gold/10 text-gold'
                  : isDark
                    ? 'text-gray-300 hover:bg-dark-300 hover:text-gold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gold'
              }`}
            >
              <span className="text-lg">{opt.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{opt.label}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {SYMBOLS[opt.currency]} {opt.currency}
                </div>
              </div>
              {currency === opt.currency && (
                <div className="w-2 h-2 rounded-full bg-gold"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
