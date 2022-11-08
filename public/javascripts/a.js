modal = new Vue({
	el: '#modal',
	data: {
		msg: '么有',
		title: '提示'
	},
	methods: {
		show: function (msg, title) {
			if (title) {
				this.title = title;
			}
			this.msg = msg;
			$('#mmodal').modal();
		}
	}
})


app = new Vue({
	el: '#app',
	data: {
		text: null,
		count: 1,
		ex: '1DAY',
		enurl: null
	},
	methods: {
		countChangeHandler() {
			const num = ~~app.count;
			if (!num || num < 1) {
				app.count = 1;
			}
			if (num > 10) {
				app.count = 10;
			}
		},
		getTempURL: function () {
			let { text, count, ex } = app;
			text = (text || '').trim();
			if (!text) return alert('请输入想说的话');
			if (count < 1 || count > 10) return alert('查看次数');
			if (!ex) return alert('失效时间');
			$("#enurl").loading({
				message: '加载中...',
				onStop: function (loading) {
					loading.overlay.fadeOut(650)
				}
			});
			axios.post('/api/create-msg', {
				text: window.btoa(encodeURIComponent(text)),
				count,
				ex
			}).then(function (response) {
				$("#enurl").loading('stop');
				var data = response.data;
				if (data.status === 1) {
					var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
					app.enurl = newURL + data.guid;
					setTimeout(function () {
						new ClipboardJS('#enurlBtn');
					}, 0);
				} else {
					modal.show("操作失败！<br>", '错误');
					throw 'failure to get the tmp url!';
				}
			}).catch(function (error) {
				console.warn(error.response);
				$("#enurl").loading('stop');
				modal.show("操作失败！<br>" + error.response.data.message, '错误')
			})
		},
		copyUrl: function () {
			modal.show('已复制到剪贴板<br>', '成功');
		}
	}
})