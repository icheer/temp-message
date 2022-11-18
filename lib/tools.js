// var redis = require('redis');
// var uuidv4 = require('uuid/v4');
var asyncRedis = require('async-redis');

Number.prototype.toBase = function (base) {
	const symbols = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-~!.,@'.split('');
	let decimal = this;
	let conversion = '';

	if (base > symbols.length || base <= 1) {
		return false;
	}

	while (decimal >= 1) {
		conversion = symbols[(decimal - (base * Math.floor(decimal / base)))] + conversion;
		decimal = Math.floor(decimal / base);
	}

	return (base < 11) ? parseInt(conversion) : conversion;
}

/**
 * Redis存档的Hash消息管理工具
 * @param  {Object} config  配置文件
 * @return {[type]}        [description]
 */
module.exports = function (conf) {

	/**
	 * 初始化Redis连接
	 * @return {[type]} [description]
	 */
	var init = () => {
		this.conf = conf;
		this.prefix = conf.field_lists;
		// noderedis密码等选项
		var options = conf.redis_pwd ? { password: conf.redis_pwd } : null;
		// redis client instance
		// this.client = redis.createClient(conf.redis_port, conf.redis_host, options);
		this.client = asyncRedis.createClient(conf.redis_port, conf.redis_host, options);

		this.client.on("error", (err) => {
			console.log("redis Error " + err);
		});
	}

	/**
	 * 删除Redis中的某条消息
	 * @param  {string}   guid     消息ID
	 * @return {Promise}            [description]
	 */
	this.delete = guid => {
		return this.client.del(this.prefix + guid);
	}

	/**
	 * 获取一个不会重复的唯一ID
	 * @return {string}            [description]
	 */
	this.getUniID = () => {
		let str = Date.now().toString().slice(3);
		str = ~~(Math.random() * 100) + str;
		str = (+str).toBase(64);
		str = ('00' + str).slice(-7);
		return str;
	}

	/**
	 * 插入一条消息
	 * @param  {Object}    payload       欲被插入的内容
	 * @return {Promise}            [description]
	 */
	this.insert = async payload => {
		const guid = this.getUniID();
		const output = { status: null, guid };
		const EX = ~~payload.ex;
		delete payload.ex;
		await this.client.setex(this.prefix + guid, EX, JSON.stringify(payload));
		output.status = 1;
		return output;
	}

	/**
	 * 检查是否存在某条消息
	 * @param  {string}   guid     消息ID
	 * @return {Promise}            [description]
	 */
	this.exists = guid => {
		return this.client.exists(this.prefix + guid);
	}

	/**
	 * 获取某条消息
	 * @param  {string}   guid     消息ID
	 * @return {Promise}            [description]
	 */
	this.get = async guid => {
		const item = await this.client.get(this.prefix + guid);
		return !item ? null : JSON.parse(item);
	}

	/**
	 * 修改某条消息使它的count减1
	 * @param  {string}   guid     消息ID
	 * @param  {number}   count    新的count数字
	 * @return {Promise}            [description]
	 */
	this.setCount = async (guid, count = 1) => {
		let item = await this.client.get(this.prefix + guid);
		const EX = await this.client.ttl(this.prefix + guid);
		if (!item) return false;
		item = JSON.parse(item);
		item.count = count;
		return this.client.setex(this.prefix + guid, EX, JSON.stringify(item));
	}

	this.encode = (text = '') => {
		let str = encodeURIComponent(text);
		str = str.replace(/%/g, ';').split('').reverse().join('');
		str = Buffer.from(str).toString('base64');
		return str;
	}

	this.decode = (str = '') => {
		let text = '';
		try {
			text = Buffer.from(str, 'base64').toString();
			text = text.replace(/;/g, '%').split('').reverse().join('');
			text = decodeURIComponent(text);
		} catch (e) {
			text = '';
		}
		return text;
	}

	// 初始化
	init();
}