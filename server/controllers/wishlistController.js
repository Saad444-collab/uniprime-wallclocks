const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({ path: 'products', model: Product });
    if (!wishlist) {
      wishlist = { user: req.user._id, products: [] };
    } else if (wishlist.products.some(p => p === null || p === undefined)) {
      wishlist.products = wishlist.products.filter(p => p !== null && p !== undefined);
      await wishlist.save();
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      const exists = wishlist.products.some(p => p && p.toString() === productId);
      if (!exists) {
        wishlist.products.push(productId);
      }
      await wishlist.save();
    }

    await wishlist.populate({ path: 'products', model: Product });
    res.json({ success: true, message: 'Added to wishlist', data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(p => p && p.toString() !== productId);
      await wishlist.save();
      await wishlist.populate({ path: 'products', model: Product });
    }
    res.json({ success: true, message: 'Removed from wishlist', data: wishlist || { user: req.user._id, products: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
