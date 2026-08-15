import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const CURRENCY_SYMBOLS = {
  PKR: '₨',
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
  AUD: 'A$',
  AED: 'د.إ',
  SAR: '﷼',
};

const CURRENCY_FLAGS = {
  PK: '\u{1F1F5}\u{1F1F0}',
  US: '\u{1F1FA}\u{1F1F8}',
  GB: '\u{1F1EC}\u{1F1E7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  FR: '\u{1F1EB}\u{1F1F7}',
  ES: '\u{1F1EA}\u{1F1F8}',
  IT: '\u{1F1EE}\u{1F1F9}',
  NL: '\u{1F1F3}\u{1F1F1}',
  BE: '\u{1F1E7}\u{1F1EA}',
  AT: '\u{1F1E6}\u{1F1F9}',
  PT: '\u{1F1F5}\u{1F1F9}',
  IE: '\u{1F1EE}\u{1F1EA}',
  FI: '\u{1F1EB}\u{1F1EE}',
  GR: '\u{1F1EC}\u{1F1F7}',
  CA: '\u{1F1E8}\u{1F1E6}',
  AU: '\u{1F1E6}\u{1F1FA}',
  AE: '\u{1F1E6}\u{1F1EA}',
  SA: '\u{1F1F8}\u{1F1E6}',
};

const EU_FLAGS = ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES'];

const CURRENCY_MAP = {
  PK: { code: 'PKR', name: 'Pakistan', flag: CURRENCY_FLAGS.PK },
  US: { code: 'USD', name: 'United States', flag: CURRENCY_FLAGS.US },
  GB: { code: 'GBP', name: 'United Kingdom', flag: CURRENCY_FLAGS.GB },
  CA: { code: 'CAD', name: 'Canada', flag: CURRENCY_FLAGS.CA },
  AU: { code: 'AUD', name: 'Australia', flag: CURRENCY_FLAGS.AU },
  AE: { code: 'AED', name: 'UAE', flag: CURRENCY_FLAGS.AE },
  SA: { code: 'SAR', name: 'Saudi Arabia', flag: CURRENCY_FLAGS.SA },
};

for (const eu of EU_FLAGS) {
  CURRENCY_MAP[eu] = { code: 'EUR', name: 'Europe', flag: CURRENCY_FLAGS[eu] || '\u{1F1EA}\u{1F1FA}' };
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('uniprime_currency') || 'PKR';
    } catch { return 'PKR'; }
  });
  const [countryCode, setCountryCode] = useState(() => {
    try {
      return localStorage.getItem('uniprime_country') || null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [manualOverride, setManualOverride] = useState(() => {
    try {
      return localStorage.getItem('uniprime_currency_override') === 'true';
    } catch { return false; }
  });

  const detectCurrency = useCallback(async () => {
    try {
      const res = await API.get('/currency/detect');
      const data = res.data.data;
      if (!manualOverride) {
        setCurrency(data.currencyCode);
        setCountryCode(data.countryCode);
        try {
          localStorage.setItem('uniprime_currency', data.currencyCode);
          if (data.countryCode) localStorage.setItem('uniprime_country', data.countryCode);
        } catch {}
      }
    } catch {
      if (!manualOverride) {
        setCurrency('PKR');
        setCountryCode('PK');
      }
    }
    setLoading(false);
  }, [manualOverride]);

  useEffect(() => {
    detectCurrency();
  }, [detectCurrency]);

  const switchCurrency = useCallback((newCurrency, newCountryCode) => {
    setCurrency(newCurrency);
    setCountryCode(newCountryCode);
    setManualOverride(true);
    try {
      localStorage.setItem('uniprime_currency', newCurrency);
      if (newCountryCode) localStorage.setItem('uniprime_country', newCountryCode);
      localStorage.setItem('uniprime_currency_override', 'true');
    } catch {}
  }, []);

  const resetCurrency = useCallback(() => {
    setManualOverride(false);
    try {
      localStorage.removeItem('uniprime_currency_override');
    } catch {}
    detectCurrency();
  }, [detectCurrency]);

  const formatPrice = useCallback((amount) => {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    if (currency === 'PKR') {
      return `${symbol} ${Math.round(amount || 0).toLocaleString()}`;
    }
    return `${symbol}${(Number(amount) || 0).toFixed(2)}`;
  }, [currency]);

  const getDisplayPrice = useCallback((product) => {
    if (!product) return 0;
    const mcp = product.multiCurrencyPrices;
    if (mcp) {
      const get = typeof mcp.get === 'function' ? (k) => mcp.get(k) : (k) => mcp[k];
      const val = get(currency);
      if (val !== undefined && val !== null) {
        const saleVal = get(currency + '_sale');
        if (saleVal !== undefined && saleVal !== null && saleVal < val) return Number(saleVal);
        return Number(val);
      }
    }
    const basePrice = product.price;
    const salePrice = product.salePrice;
    if (salePrice !== undefined && salePrice !== null && salePrice < basePrice) return Number(salePrice);
    return Number(basePrice ?? 0);
  }, [currency]);

  const getFlag = useCallback(() => {
    if (countryCode) {
      if (CURRENCY_FLAGS[countryCode]) return CURRENCY_FLAGS[countryCode];
      if (EU_FLAGS.includes(countryCode)) return '\u{1F1EA}\u{1F1FA}';
    }
    return CURRENCY_FLAGS.PK;
  }, [countryCode]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      countryCode,
      symbol: CURRENCY_SYMBOLS[currency] || '$',
      flag: getFlag(),
      loading,
      manualOverride,
      switchCurrency,
      resetCurrency,
      formatPrice,
      getDisplayPrice,
      currencyMap: CURRENCY_MAP,
      supportedCurrencies: Object.keys(CURRENCY_SYMBOLS),
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
