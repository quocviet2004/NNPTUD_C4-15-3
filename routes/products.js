var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products'); // Đảm bảo đường dẫn này đúng
const inventoryModel = require('../models/inventory'); // Nhớ import model Inventory vào đây
const slugify = require('slugify');

/* 1. GET ALL PRODUCTS */
router.get('/', async function (req, res, next) {
    let queries = req.query;
    let minPrice = queries.minprice ? queries.minprice : 0;
    let maxPrice = queries.maxprice ? queries.maxprice : 100000000;
    let titleQ = queries.title ? queries.title : '';

    let result = await productModel.find({
        isDeleted: false,
        title: new RegExp(titleQ, 'i'),
        price: {
            $gte: minPrice,
            $lte: maxPrice
        }
    }).populate({
        path: 'category',
        select: 'name'
    });
    res.send(result);
});

/* 2. GET PRODUCT BY ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "KHÔNG TÌM THẤY ID" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

/* 3. POST - TẠO PRODUCT VÀ TỰ ĐỘNG TẠO KHO (INVENTORY) */
router.post('/', async function (req, res, next) {
    try {
        // Fix lỗi slugify: kiểm tra title trước, nếu không có thì lấy name
        let inputTitle = req.body.title || req.body.name;

        if (!inputTitle) {
            return res.status(400).send({ message: "Vui lòng nhập 'title' hoặc 'name' cho sản phẩm" });
        }

        let newProduct = new productModel({
            title: inputTitle,
            slug: slugify(inputTitle, {
                replacement: '-',
                lower: true,
                strict: true,
            }),
            price: req.body.price || 0,
            description: req.body.description,
            category: req.body.category,
            images: req.body.images
        });

        // Lưu Product
        await newProduct.save();

        // TỰ ĐỘNG TẠO 1 INVENTORY TƯƠNG ỨNG (Yêu cầu bài học)
        let newInventory = new inventoryModel({
            product: newProduct._id,
            stock: 0,
            reserved: 0,
            soldCount: 0
        });
        await newInventory.save();

        // Trả về sản phẩm vừa tạo
        res.status(201).send(newProduct);

    } catch (error) {
        res.status(400).send({ message: "Lỗi tạo sản phẩm: " + error.message });
    }
});

/* 4. PUT - CẬP NHẬT PRODUCT */
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await productModel.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

/* 5. DELETE - XÓA MỀM PRODUCT */
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await productModel.findByIdAndUpdate(id, {
            isDeleted: true
        }, {
            new: true
        });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;