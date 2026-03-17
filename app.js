var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');

// 1. Khai báo các Router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var inventoryRouter = require('./routes/inventory'); // Nhớ file này phải tồn tại trong thư mục routes

var app = express();

// --- PHẦN KẾT NỐI DATABASE (VIỆT KIỂM TRA KỸ CHỖ NÀY) ---
// Thử dùng link đầy đủ này (mình đã thay user/pass của bạn vào):
const atlasURI = 'mongodb://viethutech:Viet123456%40@ac-a9u8pp8-shard-00-00.bxm1fy1.mongodb.net:27017,ac-a9u8pp8-shard-00-01.bxm1fy1.mongodb.net:27017,ac-a9u8pp8-shard-00-02.bxm1fy1.mongodb.net:27017/NNPTUD-C3?ssl=true&replicaSet=atlas-3mgnxm-shard-0&authSource=admin&retryWrites=true&w=majority';
// THỰC HIỆN KẾT NỐI (Thiếu cái này là không chạy được nè Việt)
mongoose.connect(atlasURI)
  .then(() => console.log("✅ Đã kết nối thành công với MongoDB Atlas!"))
  .catch((err) => console.log("❌ Lỗi kết nối rồi Việt ơi: ", err.message));

mongoose.connection.on('disconnected', () => {
  console.log("❌ Đã ngắt kết nối database");
});
// ------------------------------------------------------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2. Các Middleware (Phải đặt TRƯỚC các app.use Router)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 3. Đăng ký các Route
app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/inventory', inventoryRouter); // Chạy Inventory ở đây

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;