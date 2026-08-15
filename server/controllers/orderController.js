const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { getProductPrice, getCurrencyInfo, CURRENCIES, DEFAULT_CURRENCY, ALLOWED_CURRENCIES, hasCurrencyPrice } = require('../utils/currencyConfig');

const PAYMENT_METHODS = ['cod', 'card', 'upi', 'bank', 'easypaisa', 'jazzcash'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    const requestedCurrency = String(req.body.currencyCode || '').toUpperCase();
    const currencyCode = (ALLOWED_CURRENCIES.includes(requestedCurrency))
      ? requestedCurrency
      : (req.currencyCode || DEFAULT_CURRENCY);
    const countryCode = req.countryCode || null;
    const currInfo = getCurrencyInfo(currencyCode);

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }
    if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Valid payment method is required' });
    }

    let subtotal = 0;
    const orderItems = [];
    const stockUpdates = [];
    const seenProducts = new Set();

    for (const item of items) {
      if (!item.product || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        return res.status(400).json({ success: false, message: 'Invalid item in order' });
      }
      const quantity = Number(item.quantity);
      if (seenProducts.has(item.product)) {
        return res.status(400).json({ success: false, message: 'Duplicate product in order items' });
      }
      seenProducts.add(item.product);

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found` });
      }
      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `${product.name} is no longer available` });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      if (!hasCurrencyPrice(product, currencyCode)) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is not available in ${currencyCode}. Please place the order in ${DEFAULT_CURRENCY}.`
        });
      }

      const price = getProductPrice(product, currencyCode);
      subtotal += price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: (product.images && product.images[0]) || '',
        price,
        quantity
      });

      stockUpdates.push({ id: product._id, quantity });
    }

    const shippingThreshold = currencyCode === 'PKR' ? 10000 : 100;
    const shippingCost = subtotal >= shippingThreshold ? 0 : (currencyCode === 'PKR' ? 49 : 4.99);
    let discount = 0;
    let appliedCouponCode;
    let couponUsageLimit;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: String(couponCode).toUpperCase(),
        isActive: true,
        expiryDate: { $gt: Date.now() }
      });
      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
      }
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
      if (subtotal < coupon.minOrderValue) {
        return res.status(400).json({ success: false, message: `Minimum order value of ${coupon.minOrderValue} required for this coupon` });
      }
      if (coupon.discountType === 'percentage') {
        discount = Math.min((subtotal * coupon.discountValue) / 100, subtotal);
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
      appliedCouponCode = coupon.code;
      couponUsageLimit = coupon.usageLimit;
    }

    const totalAmount = Math.max(0, subtotal + shippingCost - discount);

    const restoredStock = [];
    for (const update of stockUpdates) {
      const result = await Product.findOneAndUpdate(
        { _id: update.id, stock: { $gte: update.quantity } },
        { $inc: { stock: -update.quantity } },
        { returnDocument: 'after' }
      );
      if (!result) {
        for (const previous of restoredStock) {
          await Product.findByIdAndUpdate(previous.id, { $inc: { stock: previous.quantity } });
        }
        return res.status(400).json({ success: false, message: 'Stock changed during checkout, please try again' });
      }
      restoredStock.push({ id: update.id, quantity: update.quantity });
    }

    let order;
    try {
      order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        subtotal: Math.round(subtotal * 100) / 100,
        shippingCost,
        discount: Math.round(discount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod,
        couponCode: appliedCouponCode,
        currencyCode,
        currencySymbol: currInfo.symbol,
        countryCode,
      });
    } catch (err) {
      await Product.bulkWrite(stockUpdates.map(u => ({
        updateOne: { filter: { _id: u.id }, update: { $inc: { stock: u.quantity } } }
      })));
      throw err;
    }

    if (appliedCouponCode) {
      const couponUpdate = await Coupon.findOneAndUpdate(
        { code: appliedCouponCode, usedCount: { $lt: couponUsageLimit } },
        { $inc: { usedCount: 1 } },
        { returnDocument: 'after' }
      );
      if (!couponUpdate) {
        await Product.bulkWrite(stockUpdates.map(u => ({
          updateOne: { filter: { _id: u.id }, update: { $inc: { stock: u.quantity } } }
        })));
        await Order.findByIdAndDelete(order._id);
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
    }

    await User.findByIdAndUpdate(req.user._id, { $pull: { cart: { product: { $in: items.map(i => i.product) } } } });

    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({ path: 'user', select: 'name email phone', model: User });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));
    const query = {};
    if (status) query.orderStatus = status;
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { orderNumber: { $regex: escaped, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: escaped, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: escaped, $options: 'i' } },
        { 'shippingAddress.city': { $regex: escaped, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate({ path: 'user', select: 'name email', model: User })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, data: { orders, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status is required' });
    }
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: `Order already ${order.orderStatus}` });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    if (orderStatus === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      if (order.couponCode) {
        await Coupon.findOneAndUpdate({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
      }
    }

    await order.save();
    res.json({ success: true, message: `Order ${orderStatus}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;
    if (!couponCode || typeof couponCode !== 'string') {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiryDate: { $gt: Date.now() } });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const orderTotal = Number(subtotal);
    if (!Number.isFinite(orderTotal) || orderTotal < 0) {
      return res.status(400).json({ success: false, message: 'Valid subtotal is required' });
    }
    if (orderTotal < coupon.minOrderValue) {
      const currInfo = getCurrencyInfo(req.currencyCode || 'PKR');
      return res.status(400).json({ success: false, message: `Minimum order value of ${currInfo.symbol}${coupon.minOrderValue} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.min((orderTotal * coupon.discountValue) / 100, orderTotal);
    } else {
      discount = Math.min(coupon.discountValue, orderTotal);
    }

    res.json({ success: true, data: { discount: Math.round(discount * 100) / 100, coupon: coupon.code } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const period = String(req.query.period || '30d');

    const rangeDays =
      period === 'today' ? 0 :
      period === '7d' ? 6 :
      period === '90d' ? 89 : 29;

    const rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - rangeDays);
    if (period === 'today') rangeStart.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalProducts,
      lowStockCount,
      orderSummary,
      periodOrderSummary,
      statusAgg,
      paymentAgg,
      topSellers,
      monthAgg,
      weekAgg,
      lowStockProducts
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 5 } }),
      Order.aggregate([
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, '$totalAmount', 0] } } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, '$totalAmount', 0] } }, units: { $sum: { $sum: '$items.quantity' } } } }
      ]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        { $group: { _id: '$paymentMethod', orders: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, '$totalAmount', 0] } } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' }, total: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
        { $sort: { qty: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $match: { orderStatus: 'delivered', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: 'delivered', createdAt: { $gte: rangeStart } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Product.find({ stock: { $lt: 5 } }).select('name stock sku').sort({ stock: 1 }).limit(8)
    ]);

    const summary = orderSummary[0] || { totalOrders: 0, totalRevenue: 0 };
    const periodSummary = periodOrderSummary[0] || { orders: 0, revenue: 0, units: 0 };
    const statusCounts = {};
    statusAgg.forEach(s => { statusCounts[s._id] = s.count; });

    const paymentMethods = {};
    paymentAgg.forEach(p => {
      paymentMethods[p._id] = { orders: p.orders, revenue: Math.round((p.revenue || 0) * 100) / 100 };
    });

    res.json({
      success: true,
      data: {
        totalOrders: summary.totalOrders || 0,
        totalRevenue: Math.round((summary.totalRevenue || 0) * 100) / 100,
        totalCustomers,
        totalProducts,
        lowStock: lowStockCount,
        pendingOrders: (statusCounts.pending || 0) + (statusCounts.confirmed || 0),
        periodOrders: periodSummary.orders || 0,
        periodRevenue: Math.round((periodSummary.revenue || 0) * 100) / 100,
        periodUnits: periodSummary.units || 0,
        periodAvgOrderValue: periodSummary.orders ? Math.round(((periodSummary.revenue / periodSummary.orders) || 0) * 100) / 100 : 0,
        statusCounts,
        paymentMethods,
        topProducts: topSellers,
        lowStockProducts: lowStockProducts || [],
        monthlyRevenue: monthAgg,
        weeklyRevenue: weekAgg,
        period
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { ids, orderStatus } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Order IDs are required' });
    }
    if (!orderStatus || !['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const result = await Order.updateMany({ _id: { $in: ids } }, { $set: { orderStatus } });
    res.json({ success: true, message: `Updated ${result.modifiedCount} order(s) to ${orderStatus}`, data: { modified: result.modifiedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already marked as paid' });
    }
    if (order.paymentMethod === 'easypaisa') {
      return res.status(400).json({ success: false, message: 'Easypaisa orders must be verified via payment proof' });
    }
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot mark a cancelled order as paid' });
    }

    order.paymentStatus = 'paid';
    await order.save();
    res.json({ success: true, message: 'Order marked as paid', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order.user || order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: `Order already ${order.orderStatus}` });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a paid order' });
    }

    order.orderStatus = 'cancelled';
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
    }
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportOrders = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query)
      .populate({ path: 'user', select: 'name email phone', model: User })
      .sort({ createdAt: -1 });

    const esc = (v) => {
      const s = String(v ?? '');
      const sanitized = /^[=+\-@]/.test(s) ? `'${s}` : s;
      return /[",\n]/.test(sanitized) ? `"${sanitized.replace(/"/g, '""')}"` : sanitized;
    };

    const rows = [];
    rows.push([
      'Order #', 'Date', 'Customer Name', 'Email', 'Phone',
      'City', 'Items', 'Subtotal', 'Shipping', 'Discount',
      'Total', 'Currency', 'Payment Method', 'Payment Status',
      'Order Status', 'Coupon'
    ]);

    for (const o of orders) {
      rows.push([
        o.orderNumber,
        o.createdAt.toISOString(),
        o.user?.name || o.shippingAddress?.fullName || '',
        o.user?.email || '',
        o.shippingAddress?.phone || '',
        o.shippingAddress?.city || '',
        o.items.reduce((s, it) => s + it.quantity, 0),
        o.subtotal,
        o.shippingCost,
        o.discount,
        o.totalAmount,
        o.currencyCode || 'PKR',
        o.paymentMethod,
        o.paymentStatus,
        o.orderStatus,
        o.couponCode || ''
      ].map(esc));
    }

    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${dateStr}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, validateCoupon, markOrderPaid, cancelMyOrder, getDashboardStats, exportOrders, bulkUpdateOrderStatus };
