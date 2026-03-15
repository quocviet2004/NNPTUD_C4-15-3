var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/auth', require('./routes/auth'));

// --- PHẦN THAY ĐỔI QUAN TRỌNG NHẤT Ở ĐÂY ---
// Bạn hãy copy cái link từ nút "Connect" trên web MongoDB Atlas rồi dán vào đây
// Mình đã điền sẵn mật khẩu 12345678910 của bạn vào rồi nhé
// Thay toàn bộ dòng atlasURI cũ bằng dòng này:
const atlasURI = 'mongodb+srv://user1:12345678910@cluster0.bxm1fy1.mongodb.net/NNPTUD-C3?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(atlasURI);
// ------------------------------------------

mongoose.connection.on('connected',()=>{
  console.log("✅ Đã kết nối thành công với MongoDB Atlas!");
})
mongoose.connection.on('disconnected',()=>{
  console.log("❌ Đã ngắt kết nối database");
})

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