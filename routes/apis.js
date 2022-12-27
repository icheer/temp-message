var util = require('util');
var express = require('express');
var router = express.Router();
var conf = require('../config.js');
var mtool = new (require('../lib/tools.js'))(conf);// 消息操作工具
var RateLimit = require('express-rate-limit');

// 限制生成临时链接API的访问次数
var apiLimiter = new RateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: conf.rate_limit,    // 频次
	delayMs: 0,               // disabled 延迟响应
});

const ONE_HOUR = 3600;
const ONE_DAY = 86400;
const exDict = ['5MIN', '15MIN', '1HOUR', '1DAY', '7DAY', '15DAY'];
const exList = [5 * 60, 15 * 60, ONE_HOUR, ONE_DAY, 7 * ONE_DAY, 15 * ONE_DAY];

/* 生成消息的GUID */
router.post('/create-msg', apiLimiter, async (req, res, next) => {
	// 用户输出的内容
	const output = { status: 0, guid: null };
	let { text, count = 1, ex } = req.body;
	text = mtool.decode(text);
	text = text.replace(/\</g, '&lt;'); // 由于支持了markdown,这里简单XSS过滤一下,废掉所有用户自行输入的小于号(HTML标签)
	if (text.length > 1500) {
		text = text.slice(0, 1500);
	}
	count = +count;
	if (!count || !Number.isInteger(count) || count < 1 || count > 10) {
		count = 1;
	}
	const exIdx = exDict.indexOf(ex);
	if (exIdx === -1) {
		res.send(output);
		return;
	}
	ex = exList[exIdx];
	const result = await mtool.insert({ text, count, ex });
	output.status = result.status;
	output.guid = result.guid;
	console.info('GUID: ' + result.guid + '\n' + 'TEXT: ' + text + '\n' + 'EX: ' + exDict[exIdx]);
	res.send(output);
});

/**
 * 提取信息
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        guid [description]
 * @return {[type]}      [description]
 */
router.post('/read-msg', async (req, res) => {
	const guid = req.body.guid;
	const output = { status: 0, text: null, count: 0 };
	const item = await mtool.get(guid);
	console.info('READ GUID: ' + guid + ` (${!item ? 'FAIL' : item.count})`);
	if (!item) {
		res.send(output);
		return;
	}
	output.status = 1;
	output.text = mtool.encode(item.text);
	output.count = item.count;
	output.ex = item.ex;
	if (!item.count || item.count <= 1) {
		await mtool.delete(guid);
	} else {
		await mtool.setCount(guid, item.count - 1);
	}
	res.send(output);
})

module.exports = router;
