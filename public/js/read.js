// markdown相关
var mdConverter = new showdown.Converter();
mdConverter.setOption('simpleLineBreaks', true);
mdConverter.setOption('simplifiedAutoLink', true);
mdConverter.setOption('excludeTrailingPunctuationFromURLs', true);
mdConverter.setOption('literalMidWordUnderscores', true);
mdConverter.setOption('strikethrough', true);
mdConverter.setOption('tasklists', true);
mdConverter.setOption('tables', true);

// 查看消息需要用到的JS
app = new Vue({
	el: '#app',
	data: {
		status: -1,
		text: null,
		count: null
	},
	computed: {
		mdConverter: function () {
			return mdConverter;
		}
	},
	mounted: function () {
		// 从URL获取GUID，然后透过POST获取消息
		var guid = reg_guid.exec(window.location.pathname);
		if (!guid) return;
		guid = guid[0].replace(/^\//, '');
		axios.post('/api/read-msg', {
			guid: guid
		}).then(function (response) {
			var data = response.data;
			app.status = data.status;
			app.text = app.decode(data.text);
			app.count = data.count - 1;
			if (app.count < 0) app.count = 0;
		}).catch(function (error) {
			alert('发生错误！')
			throw error;
		});
	},
	methods: {
		decode: function (str = '') {
			let text = '';
			try {
				text = window.atob(str);
				text = text.replace(/;/g, '%').split('').reverse().join('');
				text = decodeURIComponent(text);
			} catch (e) {
				text = '';
			}
			return text;
		}
	}
});
