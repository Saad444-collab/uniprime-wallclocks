const { Inventory, Stock, Warehouse, StockMovement } = require('../models').cluster6;
const createBaseRepository = require('../utils/baseRepository');

const inventory = createBaseRepository(Inventory);
const stock = createBaseRepository(Stock);
const warehouse = createBaseRepository(Warehouse);
const stockMovement = createBaseRepository(StockMovement);

module.exports = {
  cluster: 'cluster6',
  models: { Inventory, Stock, Warehouse, StockMovement },
  inventory,
  stock,
  warehouse,
  stockMovement
};