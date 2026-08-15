function createBaseRepository(Model) {
  return {
    Model,
    create: (data, options) => Model.create(data, options),
    findById: (id, projection, options) => Model.findById(id, projection, options),
    findOne: (query, projection, options) => Model.findOne(query, projection, options),
    find: (query, projection, options) => Model.find(query, projection, options),
    findByIdAndUpdate: (id, update, options) => Model.findByIdAndUpdate(id, update, options),
    findByIdAndDelete: (id, options) => Model.findByIdAndDelete(id, options),
    findOneAndUpdate: (query, update, options) => Model.findOneAndUpdate(query, update, options),
    deleteMany: (query, options) => Model.deleteMany(query, options),
    updateMany: (query, update, options) => Model.updateMany(query, update, options),
    countDocuments: (query, options) => Model.countDocuments(query, options),
    distinct: (field, query, options) => Model.distinct(field, query, options),
    aggregate: (pipeline, options) => Model.aggregate(pipeline, options),
    bulkWrite: (ops, options) => Model.bulkWrite(ops, options),
    save: (doc) => doc.save(),
    delete: (doc) => doc.deleteOne(),
    collection: () => Model.collection
  };
}

module.exports = createBaseRepository;