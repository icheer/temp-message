var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var apis = require('./routes/apis');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use('/api/', blockBots, apis);
app.use('/', blockBots, index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
  res.locals.message = 'Not Found';
  res.locals.error = new Error('Not Found');
  res.locals.error.status = 404;
  res.status(404);
  res.render('error');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 屏蔽讨厌的微信爬虫,别人私聊你爬啥呢?
const isbot = require('isbot');
isbot.extend([
  'Mozilla/\\d{1,2}.\\d{1,2} \\(iPhone; CPU iPhone OS \\S{6,9} like Mac OS X\\) AppleWebKit/\\d{1,3}.\\d{1,2}.\\d{1,2} \\(KHTML, like Gecko\\) Mobile/[a-zA-Z0-9]{4,5} MicroMessenger/\\d{1}.\\d{1}.\\d{1} NetType/WIFI Language/zh_CN',
]);
function blockBots(req, res, next) {
  const ua = req.header('user-agent');
  const shouldBlock = isbot(ua);
  if (shouldBlock) {
    console.log(`UA blocked: ${ua}`);
    res.status(502).send('502 Bad Gateway | nginx 1.20.1');
    return;
  }
  next();
}

module.exports = app;
