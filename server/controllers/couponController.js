const { coupon: couponRepo } = require('../repositories/productRepository');
const { logAdminAction } = require('../services/logService');

const toBool = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'false') return false;
  if (value === 'true') return true;
  return Boolean(value);
};

const getCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));
    const query = {};
    if (search) query.code = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

    const total = await couponRepo.countDocuments(query);
    const coupons = await couponRepo.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, data: { coupons, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } = req.body;

    if (!code || !discountType || discountValue === undefined || discountValue === '' || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Code, discount type, discount value, and expiry date are required' });
    }
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ success: false, message: 'Discount type must be percentage or fixed' });
    }
    const value = Number(discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ success: false, message: 'Discount value must be a positive number' });
    }
    if (discountType === 'percentage' && value > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100' });
    }
    if (Number.isNaN(new Date(expiryDate).getTime()) || new Date(expiryDate) <= Date.now()) {
      return res.status(400).json({ success: false, message: 'Expiry date must be a valid future date' });
    }

    const couponCode = String(code).toUpperCase().trim();
    const existing = await couponRepo.findOne({ code: couponCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await couponRepo.create({
      code: couponCode,
      discountType,
      discountValue: value,
      minOrderValue: Math.max(0, Number(minOrderValue) || 0),
      expiryDate,
      usageLimit: Math.max(1, Number(usageLimit) || 1),
      isActive: isActive === undefined ? true : toBool(isActive)
    });

    logAdminAction({ admin: req.user?._id, action: 'create_coupon', targetType: 'Coupon', targetId: coupon._id, details: { code: couponCode } });
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await couponRepo.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } = req.body;

    if (discountType !== undefined && !['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ success: false, message: 'Discount type must be percentage or fixed' });
    }
    if (discountValue !== undefined && discountValue !== '') {
      const value = Number(discountValue);
      if (!Number.isFinite(value) || value <= 0) {
        return res.status(400).json({ success: false, message: 'Discount value must be a positive number' });
      }
      if (discountType === 'percentage' || (!discountType && coupon.discountType === 'percentage')) {
        if (value > 100) {
          return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100' });
        }
      }
      coupon.discountValue = value;
    }
    if (expiryDate !== undefined) {
      const exp = new Date(expiryDate);
      if (Number.isNaN(exp.getTime()) || exp <= Date.now()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be a valid future date' });
      }
      coupon.expiryDate = exp;
    }

    if (code) {
      const newCode = String(code).toUpperCase().trim();
      const dup = await couponRepo.findOne({ code: newCode, _id: { $ne: coupon._id } });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
      coupon.code = newCode;
    }
    if (discountType) coupon.discountType = discountType;
    if (minOrderValue !== undefined) coupon.minOrderValue = Math.max(0, Number(minOrderValue) || 0);
    if (usageLimit !== undefined) coupon.usageLimit = Math.max(1, Number(usageLimit) || 1);
    if (isActive !== undefined) coupon.isActive = toBool(isActive);

    await couponRepo.save(coupon);
    logAdminAction({ admin: req.user?._id, action: 'update_coupon', targetType: 'Coupon', targetId: req.params.id });
    res.json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await couponRepo.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    await couponRepo.delete(coupon);
    logAdminAction({ admin: req.user?._id, action: 'delete_coupon', targetType: 'Coupon', targetId: req.params.id });
    res.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };