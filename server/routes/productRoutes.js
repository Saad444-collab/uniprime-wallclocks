const express = require('express');
const router = express.Router();
const { getProducts, getAdminProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, deleteProductImage, bulkUpdateProducts, exportProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createReview, getProductReviews } = require('../controllers/reviewController');

router.get('/', getProducts);
router.get('/all', protect, admin, getAdminProducts);
router.get('/export', protect, admin, exportProducts);
router.post('/bulk', protect, admin, bulkUpdateProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, admin, upload.array('images', 10), createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/image/:imageIndex', protect, admin, deleteProductImage);

router.post('/:id/reviews', protect, upload.array('reviewImages', 5), createReview);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
