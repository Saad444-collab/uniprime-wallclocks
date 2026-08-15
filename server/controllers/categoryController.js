const { category: categoryRepo, product: productRepo } = require('../repositories/productRepository');
const slugify = require('../utils/slugify');
const { logAdminAction } = require('../services/logService');

const getCategories = async (req, res) => {
  try {
    const categories = await categoryRepo.listActive();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const slug = slugify(name);

    const existing = await categoryRepo.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await categoryRepo.create({ name, slug, description, image });
    logAdminAction({ admin: req.user?._id, action: 'create_category', targetType: 'Category', targetId: category._id, details: { name } });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await categoryRepo.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    logAdminAction({ admin: req.user?._id, action: 'update_category', targetType: 'Category', targetId: req.params.id });
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await categoryRepo.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await productRepo.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category with associated products. Remove products first.' });
    }

    await categoryRepo.delete(category);
    logAdminAction({ admin: req.user?._id, action: 'delete_category', targetType: 'Category', targetId: req.params.id });
    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };