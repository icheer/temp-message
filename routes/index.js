var express = require('express');
var router = express.Router();
var conf = require('../config.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  const ip = req.header('x-real-ip');
  console.log('Creator IP: ' + ip);
  res.render('home', { title: '燃尽小纸条 - 相对安全' });
});

/**
 * 提取信息
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        guid [description]
 * @return {[type]}      [description]
 */
router.get(conf.reg_guid, function (req, res) {
  const ip = req.header('x-real-ip');
  console.log('Reader IP: ' + ip);
  if (true) {
    console.log(req.header('user-agent'));
  }
  res.render('read', { title: '查看纸条内容', reg_guid: conf.reg_guid });
});

module.exports = router;
