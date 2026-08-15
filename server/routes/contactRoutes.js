const express = require('express');
const router = express.Router();
const { sendContactMessage, getContactMessages, getUnreadContactCount, markContactRead, deleteContactMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/', sendContactMessage);
router.get('/unread-count', protect, admin, getUnreadContactCount);
router.get('/', protect, admin, getContactMessages);
router.put('/:id/read', protect, admin, markContactRead);
router.delete('/:id', protect, admin, deleteContactMessage);

module.exports = router;