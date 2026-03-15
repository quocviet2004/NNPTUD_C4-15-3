let userModel = require("../schemas/users");
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let fs = require('fs'); // Thư viện đọc file có sẵn của NodeJS

module.exports = {
    // 1. Hàm tạo User mới
    CreateAnUser: async function (username, password, email, role, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        await newItem.save();
        return newItem;
    },

    // 2. Hàm lấy tất cả User chưa bị xoá
    GetAllUser: async function () {
        return await userModel.find({ isDeleted: false });
    },

    // 3. Hàm lấy User theo ID
    GetUserById: async function (id) {
        try {
            return await userModel.find({
                isDeleted: false,
                _id: id
            });
        } catch (error) {
            return false;
        }
    },

    // 4. HÀM QUAN TRỌNG NHẤT: Xử lý Đăng nhập với RS256
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        });

        if (user) {
            // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hoá trong DB
            if (bcrypt.compareSync(password, user.password)) {
                
                // --- ĐOẠN NÀY LÀ LINH HỒN CỦA BÀI KIỂM TRA ---
                // Đọc nội dung file private.pem (chìa khoá riêng) để ký Token
                const privateKey = fs.readFileSync('private.pem', 'utf8');

                // Tạo Token với thuật toán RS256 thay vì chuỗi 'secret' cũ
                return jwt.sign(
                    { id: user.id, role: user.role }, 
                    privateKey, 
                    { 
                        algorithm: 'RS256', // Bắt buộc phải khai báo RS256 ở đây
                        expiresIn: '1d' 
                    }
                );
                // --------------------------------------------

            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};