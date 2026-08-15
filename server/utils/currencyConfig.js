const CURRENCIES = {
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', decimals: 0, countries: ['PK'] },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, countries: ['US'] },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, countries: ['GB'] },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, countries: ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES'] },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2, countries: ['CA'] },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2, countries: ['AU'] },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, countries: ['AE'] },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimals: 2, countries: ['SA'] },
};

const DEFAULT_CURRENCY = 'PKR';

const COUNTRY_TO_CURRENCY = {};
for (const [code, curr] of Object.entries(CURRENCIES)) {
  for (const c of curr.countries) {
    COUNTRY_TO_CURRENCY[c] = code;
  }
}

function getCurrencyForCountry(countryCode) {
  if (!countryCode) return DEFAULT_CURRENCY;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
}

function getCurrencyInfo(code) {
  return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
}

function formatPrice(amount, currencyCode) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  if (curr.decimals === 0) {
    return `${curr.symbol} ${Math.round(amount).toLocaleString()}`;
  }
  return `${curr.symbol}${Number(amount).toFixed(curr.decimals)}`;
}

function getMcpValue(mcp, key) {
  if (!mcp) return undefined;
  if (typeof mcp.get === 'function') return mcp.get(key);
  return mcp[key];
}

function getProductPrice(product, currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  const val = getMcpValue(product.multiCurrencyPrices, code);
  if (val !== undefined) {
    const saleKey = code + '_sale';
    const saleVal = getMcpValue(product.multiCurrencyPrices, saleKey);
    if (saleVal !== undefined && saleVal !== null && saleVal < val) {
      return saleVal;
    }
    return val;
  }
  if (product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product.price;
}

function getProductPricePair(product, currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  const base = product.price;
  const sale = product.salePrice;

  const val = getMcpValue(product.multiCurrencyPrices, code);
  if (val !== undefined) {
    const saleKey = code + '_sale';
    const saleVal = getMcpValue(product.multiCurrencyPrices, saleKey);
    if (saleVal !== undefined && saleVal !== null && saleVal < val) {
      return { price: val, salePrice: saleVal };
    }
    return { price: val, salePrice: null };
  }

  return { price: base, salePrice: sale };
}

function hasCurrencyPrice(product, currencyCode) {
  const code = currencyCode || DEFAULT_CURRENCY;
  if (code === DEFAULT_CURRENCY) return true;
  return getMcpValue(product.multiCurrencyPrices, code) !== undefined;
}

function resolveCurrencyForProduct(product, currencyCode) {
  return hasCurrencyPrice(product, currencyCode) ? (currencyCode || DEFAULT_CURRENCY) : DEFAULT_CURRENCY;
}

const ALLOWED_CURRENCIES = Object.keys(CURRENCIES);

module.exports = {
  CURRENCIES,
  DEFAULT_CURRENCY,
  COUNTRY_TO_CURRENCY,
  getCurrencyForCountry,
  getCurrencyInfo,
  formatPrice,
  getProductPrice,
  getProductPricePair,
  hasCurrencyPrice,
  resolveCurrencyForProduct,
  ALLOWED_CURRENCIES,
};
