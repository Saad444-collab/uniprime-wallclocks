const express = require('express');
const router = express.Router();
const { submitPaymentProof, getMyPayments, getPaymentById, getAllPayments, verifyPayment, rejectPayment } = require('../controllers/easypaisaController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/submit/:method', protect, upload.single('screenshot'), submitPaymentProof);
router.post('/submit', protect, upload.single('screenshot'), submitPaymentProof);
router.get('/my-payments', protect, getMyPayments);
router.get('/:id', protect, getPaymentById);
router.get('/', protect, admin, getAllPayments);
router.put('/:id/verify', protect, admin, verifyPayment);
router.put('/:id/reject', protect, admin, rejectPayment);

module.exports = router;
