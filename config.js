/**
 * temp-message配置文件
 * @type {Object}
 */
module.exports = {
	// redis服务器配置
	redis_host: '127.0.0.1',
	redis_port: '6379',
	redis_pwd: null, // 没有redis密码则写 null
	field_lists: 'tempMsg_', // redis Hash列表名
	rate_limit: 3, // 单位时间内单个IP可获取最多临时链接数
	reg_guid___old: /[?a-zA-Z0-9]{8}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{4}-[?a-zA-Z0-9]{12}$/,
	reg_guid: /^\/[a-zA-Z0-9\-\_]{7}$/ // 用于匹配GUID的正则
};
