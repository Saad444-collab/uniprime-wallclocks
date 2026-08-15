const express = require('express');
const router = express.Router();
const { detectCurrency, getCurrencies } = require('../controllers/currencyController');

router.get('/detect', detectCurrency);
router.get('/list', getCurrencies);

module.exports = router;
