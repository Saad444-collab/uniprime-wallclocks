const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getAllActiveMethods } = require('../controllers/paymentSettingsController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getAllActiveMethods);
router.get('/:method', getSettings);
router.put('/:method', protect, admin, updateSettings);

module.exports = router;
