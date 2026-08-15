const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const hasOrdered = await Order.findOne({ user: req.user._id, 'items.product': productId, orderStatus: 'delivered' });
    if (!hasOrdered) {
      return res.status(400).json({ success: false, message: 'You can only review products you have purchased' });
    }

    const reviewData = {
      user: req.user._id,
      product: productId,
      rating: numericRating,
      comment
    };

    if (req.files && req.files.length > 0) {
      reviewData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const review = await Review.create(reviewData);
    const reviews = await Review.find({ product: productId, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: reviews.length
    });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate({ path: 'user', select: 'name avatar', model: User })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 10));

    const query = {};
    if (status === 'approved') query.isApproved = true;
    else if (status === 'pending') query.isApproved = false;

    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { comment: { $regex: escaped, $options: 'i' } }
      ];
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate({ path: 'user', select: 'name email', model: User })
      .populate({ path: 'product', select: 'name', model: Product })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, data: { reviews, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    const reviews = await Review.find({ product: review.product, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: reviews.length
    });

    res.json({ success: true, message: `Review ${review.isApproved ? 'approved' : 'unapproved'}`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const { product: productId } = review;
    await review.deleteOne();

    const reviews = await Review.find({ product: productId, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: reviews.length
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getProductReviews, getAllReviews, approveReview, deleteReview };
