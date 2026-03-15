const userController = require('../controllers/users');
const jwt = require('jsonwebtoken');
const fs = require('fs'); // Thêm thư viện đọc file

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;
            
            // 1. Kiểm tra xem có gửi Token lên không
            if (!token || !token.startsWith("Bearer")) {
                res.status(403).send({ message: "ban chua dang nhap" });
                return;
            }
            
            token = token.split(' ')[1];

            // --- ĐOẠN NÀY LÀ THAY ĐỔI ĐỂ CHẠY RS256 ---
            // Đọc chìa khóa công khai từ file public.pem
            const publicKey = fs.readFileSync('public.pem', 'utf8');

            // Xác thực token bằng publicKey và thuật toán RS256
            let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            // ------------------------------------------

            // 2. Tìm User dựa trên ID lấy được từ Token
            let getUser = await userController.GetUserById(result.id);
            
            // Vì getUser trả về mảng (từ find) nên ta lấy phần tử đầu tiên
            if (!getUser || getUser.length === 0) {
                res.status(403).send({ message: "ban chua dang nhap" });
            } else {
                // Lưu thông tin user vào request để các hàm sau (như /me) sử dụng
                req.user = getUser[0]; 
                next();
            }
        } catch (error) {
            // Nếu Token sai, hết hạn hoặc sai thuật toán, nó sẽ nhảy vào đây
            res.status(403).send({ message: "ban chua dang nhap" });
        }
    }
}