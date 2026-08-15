const { CURRENCIES, DEFAULT_CURRENCY } = require('../utils/currencyConfig');

const detectCurrency = (req, res) => {
  try {
    const currencyCode = req.currencyCode || DEFAULT_CURRENCY;
    const countryCode = req.countryCode || null;
    const curr = CURRENCIES[currencyCode];

    res.json({
      success: true,
      data: {
        countryCode,
        currencyCode,
        currencySymbol: curr.symbol,
        currencyName: curr.name,
        decimals: curr.decimals,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrencies = (req, res) => {
  try {
    const currencies = Object.values(CURRENCIES).map(c => ({
      code: c.code,
      symbol: c.symbol,
      name: c.name,
    }));

    res.json({
      success: true,
      data: { currencies, defaultCurrency: DEFAULT_CURRENCY }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { detectCurrency, getCurrencies };
