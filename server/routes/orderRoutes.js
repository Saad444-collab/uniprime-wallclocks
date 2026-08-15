const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, markOrderPaid, validateCoupon, cancelMyOrder, getDashboardStats, exportOrders, bulkUpdateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/validate-coupon', protect, validateCoupon);
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/stats', protect, admin, getDashboardStats);
router.get('/export', protect, admin, exportOrders);
router.post('/bulk-status', protect, admin, bulkUpdateOrderStatus);
router.get('/:id', protect, getOrderById);
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/pay', protect, admin, markOrderPaid);
router.post('/:id/cancel', protect, cancelMyOrder);

module.exports = router;
