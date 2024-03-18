require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {
  createProxyMiddleware,
  fixRequestBody,
} = require('http-proxy-middleware');
const cors = require('cors');

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const handleOnProxyReq = (proxyReq, req, res, next) => {
  if (req.locals && req.locals.internalAuth) {
    proxyReq.setHeader('Authorization', req.locals.internalAuth);
  }
  fixRequestBody(proxyReq, req);
};

const handleOnProxyReqWs = (proxyReq, req, socket, options, head) => {
  if (req.locals && req.locals.internalAuth) {
    proxyReq.setHeader('Authorization', req.locals.internalAuth);
  }
  fixRequestBody(proxyReq, req);
};

// Create proxies
const targetProxy = createProxyMiddleware({
  target: process.env.PROXY_TARGET_HOST,
  changeOrigin: true,
  logLevel: 'debug',
  ws: true,
  onProxyReq: handleOnProxyReq,
  onProxyReqWs: handleOnProxyReqWs,
});

app.use('/', indexRouter);
app.use(process.env.PROXY_PATH, targetProxy);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('Error: ' + err.message);
});

module.exports = app;
