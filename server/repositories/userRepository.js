const { User, UserSession, Wishlist } = require('../models').cluster2;
const { Product } = require('../models').cluster1;
const createBaseRepository = require('../utils/baseRepository');

const userRepo = createBaseRepository(User);
const userSessionRepo = createBaseRepository(UserSession);
const wishlistRepo = createBaseRepository(Wishlist);

const user = {
  ...userRepo,
  findByEmail: (email) => userRepo.findOne({ email }),
  findByEmailWithPassword: (email) => userRepo.findOne({ email }).select('+password'),
  findSafeById: (id) =>
    userRepo.findById(id).select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires'),
  listSafe: (query, sortOption, skip, limit) =>
    userRepo.find(query)
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
  findByIdPopulateCart: (id) =>
    userRepo.findById(id)
      .populate({ path: 'cart.product', model: Product })
      .select('-resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires'),
  removeFromCart: (userId, productIds) =>
    userRepo.findByIdAndUpdate(userId, { $pull: { cart: { product: { $in: productIds } } } })
};

const wishlist = {
  ...wishlistRepo,
  findByUserPopulate: (userId) =>
    wishlistRepo.findOne({ user: userId }).populate({ path: 'products', model: Product })
};

module.exports = {
  cluster: 'cluster2',
  models: { User, UserSession, Wishlist },
  user,
  userSession: userSessionRepo,
  wishlist,
  foreignModels: { Product }
};