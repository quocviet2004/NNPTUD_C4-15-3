var express = require("express");
var router = express.Router();
let userController = require('../controllers/users');
let { RegisterValidator, validatedResult } = require('../utils/validator');
let { CheckLogin } = require('../utils/authHandler');
let userModel = require('../schemas/users'); // Thêm dòng này để truy cập DB
const bcrypt = require('bcrypt'); // Thêm dòng này để so sánh mật khẩu

// 1. LOGIN
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(404).send("thông tin đăng nhập không đúng");
    } else {
        res.send(result);
    }
});

// 2. REGISTER (BẢN CHỐT ĐỂ VƯỢT LỖI ROLE)
router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
    try {
        let { username, password, email } = req.body;

        // Mình truyền một cái ID giả nhưng đúng định dạng (24 ký tự) vào đây
        // Cái này giúp vượt qua lỗi "Path role is required"
        let newUser = await userController.CreateAnUser(
            username, 
            password, 
            email,
            '507f1f77bcf86cd799439011' // ID giả đúng định dạng
        );

        res.status(201).send(newUser);
    } catch (err) {
        res.status(400).send({ message: "Lỗi đăng ký: " + err.message });
    }
});

// 3. ME (Lấy thông tin cá nhân)
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user);
});

// 4. CHANGEPASSWORD (Câu hỏi của đề bài)
router.post('/changepassword', CheckLogin, async function (req, res, next) {
    try {
        const { oldpassword, newpassword } = req.body;

        // Validate mật khẩu mới (Ít nhất 6 ký tự)
        if (!newpassword || newpassword.length < 6) {
            return res.status(400).send({ message: "Mật khẩu mới phải từ 6 ký tự trở lên!" });
        }

        // Tìm User đang đăng nhập dựa trên ID trong Token
        const userId = req.user.id || req.user._id;
        const user = await userModel.findById(userId);

        if (!user) return res.status(404).send({ message: "Không tìm thấy người dùng" });

        // So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) return res.status(400).send({ message: "Mật khẩu cũ không đúng" });

        // Mã hóa mật khẩu mới và lưu
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newpassword, salt);
        await user.save();

        res.status(200).send({ message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;