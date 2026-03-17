const Inventory = require('../models/inventory');
const Inventory = require('../models/inventory');

// Giả sử đây là hàm tạo product của bạn
async function createProduct(data) {
    const newProduct = await Product.create(data);
    
    // TỰ ĐỘNG TẠO INVENTORY TƯƠNG ỨNG
    await Inventory.create({
        product: newProduct._id,
        stock: 0,
        reserved: 0,
        soldCount: 0
    });
    
    return newProduct;
}