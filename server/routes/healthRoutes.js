const express = require('express');
const router = express.Router();
const { getDatabaseHealth, pingDatabases, getCollectionStats } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getDatabaseHealth);
router.get('/database', getDatabaseHealth);
router.get('/ping', protect, admin, pingDatabases);
router.get('/collections', protect, admin, getCollectionStats);

module.exports = router;