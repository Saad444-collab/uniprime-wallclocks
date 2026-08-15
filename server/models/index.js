const cluster1 = {
  Product: require('./cluster1/Product'),
  Category: require('./cluster1/Category'),
  Coupon: require('./cluster1/Coupon'),
  Subcategory: require('./cluster1/Subcategory'),
  Brand: require('./cluster1/Brand'),
  ProductVariant: require('./cluster1/ProductVariant')
};

const cluster2 = {
  User: require('./cluster2/User'),
  UserSession: require('./cluster2/UserSession'),
  Wishlist: require('./cluster2/Wishlist')
};

const cluster3 = {
  Order: require('./cluster3/Order'),
  Payment: require('./cluster3/Payment'),
  PaymentSettings: require('./cluster3/PaymentSettings')
};

const cluster4 = {
  Report: require('./cluster4/Report'),
  ReportTemplate: require('./cluster4/ReportTemplate'),
  Document: require('./cluster4/Document'),
  FileMetadata: require('./cluster4/FileMetadata')
};

const cluster5 = {
  Review: require('./cluster5/Review'),
  ContactMessage: require('./cluster5/ContactMessage'),
  Feedback: require('./cluster5/Feedback')
};

const cluster6 = {
  Inventory: require('./cluster6/Inventory'),
  Stock: require('./cluster6/Stock'),
  Warehouse: require('./cluster6/Warehouse'),
  StockMovement: require('./cluster6/StockMovement')
};

const cluster7 = {
  Notification: require('./cluster7/Notification'),
  EmailLog: require('./cluster7/EmailLog'),
  Analytics: require('./cluster7/Analytics'),
  Event: require('./cluster7/Event')
};

const cluster8 = {
  ActivityLog: require('./cluster8/ActivityLog'),
  AuditLog: require('./cluster8/AuditLog'),
  SystemLog: require('./cluster8/SystemLog'),
  AdminAction: require('./cluster8/AdminAction')
};

const byCluster = { cluster1, cluster2, cluster3, cluster4, cluster5, cluster6, cluster7, cluster8 };

const all = Object.assign({}, cluster1, cluster2, cluster3, cluster4, cluster5, cluster6, cluster7, cluster8);

module.exports = { byCluster, all, cluster1, cluster2, cluster3, cluster4, cluster5, cluster6, cluster7, cluster8 };