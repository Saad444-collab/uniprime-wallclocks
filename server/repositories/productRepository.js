const { Product, Category, Coupon } = require('../models').cluster1;
const createBaseRepository = require('../utils/baseRepository');

const productRepo = createBaseRepository(Product);
const categoryRepo = createBaseRepository(Category);
const couponRepo = createBaseRepository(Coupon);

const product = {
  ...productRepo,
  listPublic: (query, sortOption, skip, limit) =>
    productRepo.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limit),
  findBySlugActive: (slug) =>
    productRepo.findOne({ slug, isActive: true }).populate('category', 'name slug description'),
  listAdmin: (query, sortOption, skip, limit) =>
    productRepo.find(query).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limit),
  decrementStock: (id, quantity) =>
    productRepo.findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { returnDocument: 'after' }
    ),
  incrementStock: (id, quantity) =>
    productRepo.findByIdAndUpdate(id, { $inc: { stock: quantity } }),
  updateRating: (id, rating, reviewsCount) =>
    productRepo.findByIdAndUpdate(id, { rating, reviewsCount }),
  bulkStockUpdate: (updates) =>
    productRepo.bulkWrite(updates.map(u => ({
      updateOne: { filter: { _id: u.id }, update: { $inc: { stock: u.quantity } } }
    })))
};

const category = {
  ...categoryRepo,
  listActive: () => categoryRepo.find({ isActive: true }).sort({ name: 1 }),
  countProducts: (categoryId) => productRepo.countDocuments({ category: categoryId })
};

const coupon = {
  ...couponRepo,
  findActiveByCode: (code) =>
    couponRepo.findOne({ code, isActive: true, expiryDate: { $gt: Date.now() } }),
  incrementUsed: (code, usageLimit) =>
    couponRepo.findOneAndUpdate(
      { code, usedCount: { $lt: usageLimit } },
      { $inc: { usedCount: 1 } },
      { returnDocument: 'after' }
    ),
  decrementUsed: (code) =>
    couponRepo.findOneAndUpdate({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } })
};

module.exports = {
  cluster: 'cluster1',
  models: { Product, Category, Coupon },
  product,
  category,
  coupon
};