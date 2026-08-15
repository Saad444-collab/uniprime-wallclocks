const { user: userRepo, wishlist: wishlistRepo } = require('../repositories/userRepository');
const { product: productRepo } = require('../repositories/productRepository');
const { order: orderRepo, payment: paymentRepo } = require('../repositories/orderRepository');
const { review: reviewRepo } = require('../repositories/reviewRepository');
const { Product } = require('../models').cluster1;
const { User } = require('../models').cluster2;
const mongoose = require('mongoose');
const { logAdminAction, logActivity } = require('../services/logService');

const toBool = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'false') return false;
  if (value === 'true') return true;
  return Boolean(value);
};

const purgeDeadCartItems = async (user) => {
  const changed = user.cart.some(item => item.product === null || item.product === undefined);
  if (changed) {
    user.cart = user.cart.filter(item => item.product !== null && item.product !== undefined);
    await userRepo.save(user);
  }
};

const isValidProductId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));
    const query = {};
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } }
      ];
    }
    const total = await userRepo.countDocuments(query);
    const users = await userRepo.listSafe(query, { createdAt: -1 }, (pageNum - 1) * limitNum, limitNum);

    res.json({ success: true, data: { users, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { isValidObjectId } = require('mongoose');

const validateUserId = (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid user ID' });
    return false;
  }
  return true;
};

const getUserById = async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;
    const user = await userRepo.findSafeById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this user' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;
    const user = await userRepo.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }

    const { name, phone, addresses } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (addresses) user.addresses = addresses;

    if (req.user.role === 'admin') {
      if (req.body.isVerified !== undefined) user.isVerified = toBool(req.body.isVerified);
      if (req.body.role !== undefined) {
        const newRole = req.body.role === 'admin' ? 'admin' : 'customer';
        if (user._id.toString() === req.user._id.toString() && newRole !== 'admin') {
          return res.status(400).json({ success: false, message: 'You cannot remove your own admin role' });
        }
        user.role = newRole;
      }
    }

    await userRepo.save(user);
    logAdminAction({ admin: req.user?._id, action: 'update_user', targetType: 'User', targetId: req.params.id });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;
    const user = await userRepo.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    // Multi-cluster compensation: best-effort cleanup across clusters 2, 3, 5.
    await Promise.allSettled([
      orderRepo.deleteMany({ user: user._id }),
      paymentRepo.deleteMany({ user: user._id }),
      reviewRepo.deleteMany({ user: user._id }),
      wishlistRepo.deleteMany({ user: user._id })
    ]);
    await userRepo.delete(user);
    logAdminAction({ admin: req.user?._id, action: 'delete_user', targetType: 'User', targetId: req.params.id });
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    if (!isValidProductId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    const product = await productRepo.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    const user = await userRepo.findById(req.user._id);
    const existingIndex = user.cart.findIndex(item => item.product && item.product.toString() === productId);

    let newQty = qty;
    if (existingIndex > -1) {
      newQty = user.cart[existingIndex].quantity + qty;
    }
    if (newQty > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
    }

    if (existingIndex > -1) {
      user.cart[existingIndex].quantity = newQty;
    } else {
      user.cart.push({ product: productId, quantity: qty });
    }

    await userRepo.save(user);
    await user.populate({ path: 'cart.product', model: Product });
    await purgeDeadCartItems(user);
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    if (!isValidProductId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const user = await userRepo.findById(req.user._id);
    user.cart = user.cart.filter(item => item.product && item.product.toString() !== productId);
    await userRepo.save(user);
    await user.populate({ path: 'cart.product', model: Product });
    await purgeDeadCartItems(user);
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }
    if (!isValidProductId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    const product = await productRepo.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (qty > product.stock) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
    }

    const user = await userRepo.findById(req.user._id);
    const item = user.cart.find(item => item.product && item.product.toString() === productId);
    if (item) {
      item.quantity = qty;
    } else {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    await userRepo.save(user);
    await user.populate({ path: 'cart.product', model: Product });
    await purgeDeadCartItems(user);
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await userRepo.findById(req.user._id);
    user.cart = [];
    await userRepo.save(user);
    res.json({ success: true, message: 'Cart cleared', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await userRepo.findById(req.user._id);
    await user.populate({ path: 'cart.product', model: Product });
    await purgeDeadCartItems(user);
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs are required' });
    }
    const users = await userRepo.find({ _id: { $in: ids } }).select('role');
    const adminIds = users.filter(u => u.role === 'admin').map(u => u._id.toString());
    const deletableIds = ids.filter(id => !adminIds.includes(String(id)));

    if (deletableIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    await Promise.allSettled([
      orderRepo.deleteMany({ user: { $in: deletableIds } }),
      paymentRepo.deleteMany({ user: { $in: deletableIds } }),
      reviewRepo.deleteMany({ user: { $in: deletableIds } }),
      wishlistRepo.deleteMany({ user: { $in: deletableIds } })
    ]);
    const result = await userRepo.deleteMany({ _id: { $in: deletableIds } });
    res.json({ success: true, message: `Deleted ${result.deletedCount} user(s)`, data: { deleted: result.deletedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email phone role isVerified createdAt').sort({ createdAt: -1 });

    const esc = (v) => {
      const s = String(v ?? '');
      const sanitized = /^[=+\-@]/.test(s) ? `'${s}` : s;
      return /[",\n]/.test(sanitized) ? `"${sanitized.replace(/"/g, '""')}"` : sanitized;
    };

    const rows = [];
    rows.push(['Name', 'Email', 'Phone', 'Role', 'Verified', 'Created']);
    for (const u of users) {
      rows.push([u.name, u.email, u.phone || '', u.role, u.isVerified ? 'Yes' : 'No', u.createdAt ? u.createdAt.toISOString() : ''].map(esc));
    }

    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-${dateStr}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, addToCart, removeFromCart, updateCartQuantity, clearCart, getCart, bulkDeleteUsers, exportUsers };