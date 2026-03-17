var express = require('express');
var router = express.Router();
const inventoryController = require('../controllers/inventory');

// Get All
router.get('/', async (req, res) => {
    res.send(await inventoryController.getAll());
});

// Add Stock
router.post('/add-stock', async (req, res) => {
    const { product, quantity } = req.body;
    const result = await inventoryController.addStock(product, quantity);
    res.send(result);
});

// Reservation
router.post('/reservation', async (req, res) => {
    const { product, quantity } = req.body;
    const result = await inventoryController.reservation(product, quantity);
    if (!result) return res.status(400).send({ message: "Không đủ hàng trong kho!" });
    res.send(result);
});

// Sold
router.post('/sold', async (req, res) => {
    const { product, quantity } = req.body;
    const result = await inventoryController.sold(product, quantity);
    if (!result) return res.status(400).send({ message: "Không có hàng đặt trước để bán!" });
    res.send(result);
});

module.exports = router;