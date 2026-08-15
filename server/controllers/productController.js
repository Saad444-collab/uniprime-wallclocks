const mongoose = require('mongoose');
const { product: productRepo } = require('../repositories/productRepository');
const { Product } = require('../models').cluster1;
const slugify = require('../utils/slugify');
const fs = require('fs');
const path = require('path');
const { getProductPricePair, ALLOWED_CURRENCIES, resolveCurrencyForProduct } = require('../utils/currencyConfig');
const { logAdminAction } = require('../services/logService');

function cleanupUploadedFiles(files) {
  if (!files || files.length === 0) return;
  files.forEach(file => {
    if (file && file.filename) {
      const filePath = path.join(__dirname, '../../uploads', file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
}

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort, minPrice, maxPrice, featured, bestSeller, newArrival } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const currencyCode = (req.query.currencyCode || req.currencyCode || 'PKR').toUpperCase();
    const priceField = ALLOWED_CURRENCIES.includes(currencyCode) && currencyCode !== 'PKR'
      ? `multiCurrencyPrices.${currencyCode}`
      : 'price';

    const query = { isActive: true };

    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category.filter(c => mongoose.Types.ObjectId.isValid(c)) };
      } else if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        query.category = null;
      }
    }
    if (featured === 'true') query.featured = true;
    if (bestSeller === 'true') query.bestSeller = true;
    if (newArrival === 'true') query.newArrival = true;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query[priceField] = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (minPrice !== undefined && minPrice !== '' && Number.isFinite(min)) query[priceField].$gte = min;
      if (maxPrice !== undefined && maxPrice !== '' && Number.isFinite(max)) query[priceField].$lte = max;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { brand: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { [priceField]: 1 };
    if (sort === 'price-desc') sortOption = { [priceField]: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const total = await productRepo.countDocuments(query);
    const products = await productRepo.listPublic(query, sortOption, (pageNum - 1) * limitNum, limitNum);

    const enriched = products.map(p => {
      const obj = p.toObject();
      const effectiveCurrency = resolveCurrencyForProduct(p, currencyCode);
      const { price, salePrice } = getProductPricePair(p, effectiveCurrency);
      obj.displayPrice = price;
      obj.displaySalePrice = salePrice;
      obj.currencyCode = effectiveCurrency;
      return obj;
    });

    res.json({
      success: true,
      data: { products: enriched, total, page: pageNum, pages: Math.ceil(total / limitNum), currencyCode }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, sort, status } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));

    const query = {};
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } },
        { brand: { $regex: escaped, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'stock-asc') sortOption = { stock: 1 };
    if (sort === 'price-asc') sortOption = { price: 1 };

    const total = await productRepo.countDocuments(query);
    const products = await productRepo.listAdmin(query, sortOption, (pageNum - 1) * limitNum, limitNum);

    res.json({ success: true, data: { products, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await productRepo.findBySlugActive(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currencyCode = (req.query.currencyCode || req.currencyCode || 'PKR').toUpperCase();
    const effectiveCurrency = resolveCurrencyForProduct(product, currencyCode);
    const obj = product.toObject();
    const { price, salePrice } = getProductPricePair(product, effectiveCurrency);
    obj.displayPrice = price;
    obj.displaySalePrice = salePrice;
    obj.currencyCode = effectiveCurrency;

    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, sku, category, stock } = req.body;
    if (!name || !description || !price || !sku || !category || stock === undefined) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: 'Missing required fields: name, description, price, sku, category, stock' });
    }

    const data = { ...req.body };
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    if (data.salePrice) data.salePrice = Number(data.salePrice);
    ['featured', 'bestSeller', 'newArrival'].forEach(k => {
      if (data[k] !== undefined) data[k] = data[k] === true || data[k] === 'true';
    });

    if (!Number.isFinite(data.price) || data.price < 0) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
    }
    if (!Number.isFinite(data.stock) || data.stock < 0) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: 'Stock must be a valid non-negative number' });
    }
    if (data.salePrice !== undefined && !Number.isFinite(data.salePrice)) {
      cleanupUploadedFiles(req.files);
      return res.status(400).json({ success: false, message: 'Sale price must be a valid number' });
    }

    const multiCurrencyPrices = {};
    for (const curr of ALLOWED_CURRENCIES) {
      const priceKey = `price_${curr}`;
      const saleKey = `salePrice_${curr}`;
      if (data[priceKey] !== undefined && data[priceKey] !== '') {
        const parsed = Number(data[priceKey]);
        if (!Number.isFinite(parsed) || parsed < 0) {
          cleanupUploadedFiles(req.files);
          return res.status(400).json({ success: false, message: `${priceKey} must be a valid non-negative number` });
        }
        multiCurrencyPrices[curr] = parsed;
      }
      if (data[saleKey] !== undefined && data[saleKey] !== '') {
        const parsed = Number(data[saleKey]);
        if (!Number.isFinite(parsed) || parsed < 0) {
          cleanupUploadedFiles(req.files);
          return res.status(400).json({ success: false, message: `${saleKey} must be a valid non-negative number` });
        }
        multiCurrencyPrices[curr + '_sale'] = parsed;
      }
      delete data[priceKey];
      delete data[saleKey];
    }
    if (Object.keys(multiCurrencyPrices).length > 0) {
      data.multiCurrencyPrices = multiCurrencyPrices;
    }

    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }
    if (!data.slug) {
      data.slug = `product-${Date.now()}`;
    }

    const existingSlug = await productRepo.findOne({ slug: data.slug });
    if (existingSlug) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    if (req.files && req.files.length > 0) {
      data.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await productRepo.create(data);
    logAdminAction({ admin: req.user?._id, action: 'create_product', targetType: 'Product', targetId: product._id, details: { name, sku } });
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    cleanupUploadedFiles(req.files);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productRepo.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const data = { ...req.body };
    const unsetData = {};

    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.stock !== undefined && (!Number.isFinite(data.stock) || data.stock < 0)) {
      return res.status(400).json({ success: false, message: 'Stock must be a valid non-negative number' });
    }
    ['featured', 'bestSeller', 'newArrival'].forEach(k => {
      if (data[k] !== undefined) data[k] = data[k] === true || data[k] === 'true';
    });

    if (data.salePrice !== undefined) {
      if (data.salePrice === '' || data.salePrice === null) {
        delete data.salePrice;
        unsetData.salePrice = '';
      } else {
        data.salePrice = Number(data.salePrice);
        if (!Number.isFinite(data.salePrice)) {
          return res.status(400).json({ success: false, message: 'Sale price must be a valid number' });
        }
      }
    }

    let multiCurrencyPrices = {};
    if (product.multiCurrencyPrices) {
      multiCurrencyPrices = typeof product.multiCurrencyPrices.forEach === 'function'
        ? Object.fromEntries(product.multiCurrencyPrices)
        : { ...product.multiCurrencyPrices };
    }
    for (const curr of ALLOWED_CURRENCIES) {
      const priceKey = `price_${curr}`;
      const saleKey = `salePrice_${curr}`;
      if (data[priceKey] !== undefined && data[priceKey] !== '') {
        const parsed = Number(data[priceKey]);
        if (!Number.isFinite(parsed) || parsed < 0) {
          return res.status(400).json({ success: false, message: `${priceKey} must be a valid non-negative number` });
        }
        multiCurrencyPrices[curr] = parsed;
      } else if (data[priceKey] === '' || data[priceKey] === null) {
        delete multiCurrencyPrices[curr];
      }
      if (data[saleKey] !== undefined && data[saleKey] !== '') {
        const parsed = Number(data[saleKey]);
        if (!Number.isFinite(parsed) || parsed < 0) {
          return res.status(400).json({ success: false, message: `${saleKey} must be a valid non-negative number` });
        }
        multiCurrencyPrices[curr + '_sale'] = parsed;
      } else if (data[saleKey] === '' || data[saleKey] === null) {
        delete multiCurrencyPrices[curr + '_sale'];
      }
      delete data[priceKey];
      delete data[saleKey];
    }
    if (Object.keys(multiCurrencyPrices).length > 0) {
      data.multiCurrencyPrices = multiCurrencyPrices;
    } else {
      unsetData.multiCurrencyPrices = '';
    }

    if (data.name && data.name !== product.name) {
      data.slug = slugify(data.name);
      if (data.slug === '') data.slug = `product-${Date.now()}`;
      const dup = await productRepo.findOne({ slug: data.slug, _id: { $ne: product._id } });
      if (dup) {
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }

    const effectivePrice = data.price !== undefined ? data.price : product.price;
    if (!Number.isFinite(effectivePrice) || effectivePrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
    }
    const finalSalePrice = data.salePrice !== undefined
      ? data.salePrice
      : ((product.salePrice !== undefined && product.salePrice !== null) ? product.salePrice : null);
    if (finalSalePrice !== null && finalSalePrice >= effectivePrice) {
      delete data.salePrice;
      unsetData.salePrice = '';
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      data.images = [...(product.images || []), ...newImages];
    }

    const updated = await productRepo.findByIdAndUpdate(
      req.params.id,
      { $set: data, $unset: unsetData },
      { returnDocument: 'after', runValidators: true }
    );
    logAdminAction({ admin: req.user?._id, action: 'update_product', targetType: 'Product', targetId: req.params.id });
    res.json({ success: true, message: 'Product updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await productRepo.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        if (image.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '../..', image);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await productRepo.delete(product);
    logAdminAction({ admin: req.user?._id, action: 'delete_product', targetType: 'Product', targetId: req.params.id });
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const product = await productRepo.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const idx = Number(imageIndex);
    if (!Number.isInteger(idx) || idx < 0 || !product.images || idx >= product.images.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    const imagePath = product.images[idx];
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../..', imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    product.images.splice(idx, 1);
    await productRepo.save(product);

    res.json({ success: true, message: 'Image deleted', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Product IDs are required' });
    }

    let update = {};
    if (action === 'delete') {
      const result = await productRepo.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `Deleted ${result.deletedCount} product(s)`, data: { modified: result.deletedCount } });
    }

    if (action === 'active') update = { isActive: value === true };
    else if (action === 'featured') update = { featured: value === true };
    else if (action === 'bestSeller') update = { bestSeller: value === true };
    else if (action === 'newArrival') update = { newArrival: value === true };
    else if (action === 'stock') {
      const stock = Number(value);
      if (!Number.isFinite(stock) || stock < 0) {
        return res.status(400).json({ success: false, message: 'Stock must be a valid non-negative number' });
      }
      update = { stock };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }

    const result = await productRepo.updateMany({ _id: { $in: ids } }, { $set: update });
    res.json({ success: true, message: `Updated ${result.modifiedCount} product(s)`, data: { modified: result.modifiedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 });

    const esc = (v) => {
      const s = String(v ?? '');
      const sanitized = /^[=+\-@]/.test(s) ? `'${s}` : s;
      return /[",\n]/.test(sanitized) ? `"${sanitized.replace(/"/g, '""')}"` : sanitized;
    };

    const rows = [];
    rows.push(['Name', 'SKU', 'Category', 'Price (PKR)', 'Sale Price', 'Stock', 'Brand', 'Material', 'Color', 'Rating', 'Active', 'Featured', 'Best Seller', 'New Arrival', 'Created']);
    for (const p of products) {
      rows.push([
        p.name, p.sku, p.category?.name || '', p.price, p.salePrice || '', p.stock,
        p.brand || '', p.material || '', p.color || '', p.rating || 0,
        p.isActive ? 'Yes' : 'No', p.featured ? 'Yes' : 'No', p.bestSeller ? 'Yes' : 'No',
        p.newArrival ? 'Yes' : 'No', p.createdAt ? p.createdAt.toISOString() : ''
      ].map(esc));
    }

    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="products-${dateStr}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getAdminProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, deleteProductImage, bulkUpdateProducts, exportProducts };