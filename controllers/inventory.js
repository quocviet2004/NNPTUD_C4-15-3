const Inventory = require('../models/inventory');

module.exports = {
    // Lấy tất cả kho
    getAll: async () => {
        return await Inventory.find().populate('product');
    },

    // Lấy kho theo ID
    getById: async (id) => {
        return await Inventory.findById(id).populate('product');
    },

    // Tăng stock
    addStock: async (productId, quantity) => {
        return await Inventory.findOneAndUpdate(
            { product: productId },
            { $inc: { stock: quantity } },
            { new: true, upsert: true }
        );
    },

    // Giảm stock
    removeStock: async (productId, quantity) => {
        return await Inventory.findOneAndUpdate(
            { product: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );
    },

    // Đặt hàng (Reservation)
    reservation: async (productId, quantity) => {
        return await Inventory.findOneAndUpdate(
            { product: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity, reserved: quantity } },
            { new: true }
        );
    },

    // Đã bán (Sold)
    sold: async (productId, quantity) => {
        return await Inventory.findOneAndUpdate(
            { product: productId, reserved: { $gte: quantity } },
            { $inc: { reserved: -quantity, soldCount: quantity } },
            { new: true }
        );
    }
};