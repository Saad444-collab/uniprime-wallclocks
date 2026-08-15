const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');

const createPayment = async (req, res) => {
  try {
    const { orderId, method, transactionId } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({ success: false, message: 'Order ID and payment method are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.user || (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    if (!['cod', 'card', 'upi', 'bank', 'easypaisa', 'jazzcash'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }
    if (method !== order.paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method does not match the order' });
    }

    if (method === 'easypaisa' || method === 'jazzcash' || method === 'bank') {
      return res.status(400).json({
        success: false,
        message: `${method} payments require proof submission via /api/easypaisa/submit/${method}`
      });
    }

    const existing = await Payment.findOne({ order: orderId, method, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A pending payment already exists for this order' });
    }

    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      amount: order.totalAmount,
      currency: order.currencyCode || 'PKR',
      method,
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Payment record created, awaiting verification', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'orderNumber totalAmount')
      .populate({ path: 'user', select: 'name email', model: User })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, getPayments };
