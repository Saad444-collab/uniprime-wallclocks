const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, addToCart, removeFromCart, updateCartQuantity, clearCart, getCart, bulkDeleteUsers, exportUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/export', protect, admin, exportUsers);
router.post('/bulk-delete', protect, admin, bulkDeleteUsers);

router.post('/cart/add', protect, addToCart);
router.post('/cart/remove', protect, removeFromCart);
router.put('/cart/update', protect, updateCartQuantity);
router.delete('/cart/clear', protect, clearCart);
router.get('/cart', protect, getCart);

router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
