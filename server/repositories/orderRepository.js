const { Order, Payment, PaymentSettings } = require('../models').cluster3;
const { User } = require('../models').cluster2;
const createBaseRepository = require('../utils/baseRepository');

const orderRepo = createBaseRepository(Order);
const paymentRepo = createBaseRepository(Payment);
const paymentSettingsRepo = createBaseRepository(PaymentSettings);

const order = {
  ...orderRepo,
  listByUser: (userId) => orderRepo.find({ user: userId }).sort({ createdAt: -1 }),
  findByIdPopulateUser: (id) =>
    orderRepo.findById(id).populate({ path: 'user', select: 'name email phone', model: User }),
  listAdmin: (query, sortOption, skip, limit) =>
    orderRepo.find(query).populate({ path: 'user', select: 'name email', model: User }).sort(sortOption).skip(skip).limit(limit),
  listExport: (query) =>
    orderRepo.find(query).populate({ path: 'user', select: 'name email phone', model: User }).sort({ createdAt: -1 }),
  dashboardSummary: () =>
    orderRepo.aggregate([
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, '$totalAmount', 0] } } } }
    ]),
  statusCounts: () => orderRepo.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
  topSellers: () =>
    orderRepo.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' }, total: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $sort: { qty: -1 } },
      { $limit: 5 }
    ]),
  monthlyRevenue: (since) =>
    orderRepo.aggregate([
      { $match: { orderStatus: 'delivered', createdAt: { $gte: since } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } }
    ]),
  weeklyRevenue: (since) =>
    orderRepo.aggregate([
      { $match: { orderStatus: 'delivered', createdAt: { $gte: since } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } }
    ]),
  countByUser: (userId) => orderRepo.countDocuments({ user: userId }),
  findPurchasedProduct: (userId, productId) =>
    orderRepo.findOne({ user: userId, 'items.product': productId, orderStatus: 'delivered' })
};

const payment = {
  ...paymentRepo,
  listPopulateOrder: (query) =>
    paymentRepo.find(query).populate('order', 'orderNumber totalAmount orderStatus paymentStatus currencyCode').sort({ createdAt: -1 }),
  findByIdPopulateOrderUser: (id) =>
    paymentRepo.findById(id)
      .populate('order', 'orderNumber totalAmount orderStatus paymentStatus items shippingAddress currencyCode')
      .populate({ path: 'user', select: 'name email phone', model: User }),
  findPendingByOrder: (orderId, method) =>
    paymentRepo.findOne({ order: orderId, method, status: 'pending' }),
  listByUserPopulateOrder: (userId) =>
    paymentRepo.find({ user: userId }).populate('order', 'orderNumber totalAmount orderStatus paymentStatus currencyCode').sort({ createdAt: -1 })
};

const paymentSettings = {
  ...paymentSettingsRepo,
  findByMethod: (method) => paymentSettingsRepo.findOne({ method }),
  listActive: () => paymentSettingsRepo.find({ isActive: true })
};

module.exports = {
  cluster: 'cluster3',
  models: { Order, Payment, PaymentSettings },
  order,
  payment,
  paymentSettings,
  foreignModels: { User }
};