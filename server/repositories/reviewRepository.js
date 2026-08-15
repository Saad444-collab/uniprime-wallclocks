const { Review, ContactMessage, Feedback } = require('../models').cluster5;
const { User } = require('../models').cluster2;
const { Product } = require('../models').cluster1;
const createBaseRepository = require('../utils/baseRepository');

const reviewRepo = createBaseRepository(Review);
const contactMessageRepo = createBaseRepository(ContactMessage);
const feedbackRepo = createBaseRepository(Feedback);

const review = {
  ...reviewRepo,
  findExisting: (userId, productId) => reviewRepo.findOne({ user: userId, product: productId }),
  listApprovedByProduct: (productId) =>
    reviewRepo.find({ product: productId, isApproved: true }).populate({ path: 'user', select: 'name avatar', model: User }).sort({ createdAt: -1 }),
  listApprovedForRating: (productId) => reviewRepo.find({ product: productId, isApproved: true }),
  listAdmin: (query, sortOption, skip, limit) =>
    reviewRepo.find(query)
      .populate({ path: 'user', select: 'name email', model: User })
      .populate({ path: 'product', select: 'name', model: Product })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
};

const contactMessage = {
  ...contactMessageRepo,
  listWithUnread: (query, limit) => {
    const list = contactMessageRepo.find(query).sort({ createdAt: -1 }).limit(limit);
    const unreadCount = contactMessageRepo.countDocuments({ isRead: false });
    const total = contactMessageRepo.countDocuments(query);
    return Promise.all([list, unreadCount, total]).then(([messages, unread, totalCount]) => ({ messages, unreadCount: unread, total: totalCount }));
  },
  unreadCount: () => contactMessageRepo.countDocuments({ isRead: false })
};

module.exports = {
  cluster: 'cluster5',
  models: { Review, ContactMessage, Feedback },
  review,
  contactMessage,
  feedback: feedbackRepo,
  foreignModels: { User, Product }
};