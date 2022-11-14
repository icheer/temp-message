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
		window.fetch('/api/read-msg', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({ guid: guid })
		}).then(function (res) {
			return res.json();
		}).then(function (data) {
			app.text = app.decode(data.text);
			app.count = data.count - 1;
			if (app.count < 0) app.count = 0;
			app.status = data.status;
		}).catch(function (error) {
			alert('发生错误！')
			throw error;
		});
	},
	methods: {
		decode: function (str = '') {
			var text = '';
			try {
				text = window.atob(str);
				text = text.replace(/;/g, '%').split('').reverse().join('');
				text = decodeURIComponent(text);
			} catch (e) {
				text = '';
			}
			return text;
		},
		mdClickHandler(e) {
			var target = e.target;
			var tagName = target.tagName;
			if (tagName === 'IMG') {
				if (target.parentElement.tagName === 'A') {
					target = target.parentElement;
					tagName = 'A';
				} else {
					var src = target.getAttribute('src');
					e.preventDefault();
					src && window.open(src);
				}
			}
			if (tagName === 'A') {
				var href = target.getAttribute('href');
				e.preventDefault();
				href && window.open(href);
			}
		}
	}
});
