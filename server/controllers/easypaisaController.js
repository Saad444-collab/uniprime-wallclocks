const Payment = require('../models/Payment');
const Order = require('../models/Order');
const PaymentSettings = require('../models/PaymentSettings');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const PROOF_METHODS = ['easypaisa', 'jazzcash', 'bank'];

const submitPaymentProof = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    const method = String(req.params.method || 'easypaisa').toLowerCase();

    if (!PROOF_METHODS.includes(method)) {
      return res.status(400).json({ success: false, message: 'This payment method does not require proof submission' });
    }
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.paymentMethod !== method) {
      return res.status(400).json({ success: false, message: 'Payment method does not match the order' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
    }

    const existingPayment = await Payment.findOne({ order: orderId, method, status: 'pending' });
    if (existingPayment) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Payment proof already submitted. Awaiting verification.' });
    }

    const settings = await PaymentSettings.findOne({ method });
    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      amount: order.totalAmount,
      currency: order.currencyCode || 'PKR',
      method,
      accountNumber: settings?.accountNumber || '',
      transactionId: transactionId || '',
      screenshotUrl: `/uploads/${req.file.filename}`,
      status: 'pending'
    });

    order.paymentStatus = 'pending';
    order.transactionId = payment.transactionId;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully. Your order is awaiting admin verification.',
      data: payment
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'orderNumber totalAmount orderStatus paymentStatus currencyCode')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order', 'orderNumber totalAmount orderStatus paymentStatus items shippingAddress currencyCode')
      .populate({ path: 'user', select: 'name email phone', model: User });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (!payment.user) {
      return res.status(404).json({ success: false, message: 'Payment user data not found' });
    }
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber totalAmount orderStatus paymentStatus currencyCode')
      .populate({ path: 'user', select: 'name email phone', model: User })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = 'verified';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      if (order.orderStatus === 'cancelled') {
        payment.status = 'pending';
        await payment.save();
        return res.status(400).json({ success: false, message: 'Cannot verify payment for a cancelled order' });
      }
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();
    }

    res.json({ success: true, message: 'Payment verified successfully. Order confirmed.', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectPayment = async (req, res) => {
  try {
    const { adminNote } = req.body;
    if (!adminNote) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = 'rejected';
    payment.adminNote = adminNote;
    payment.rejectedAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'rejected';
      await order.save();
    }

    res.json({ success: true, message: 'Payment rejected.', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitPaymentProof, getMyPayments, getPaymentById, getAllPayments, verifyPayment, rejectPayment, PROOF_METHODS };
