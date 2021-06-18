// 0：可退款，1：退款中，2：已退款
const btnMaps = new Map([
  [0, '退款'],
  [1, '退款中'],
  [2, '已退款'],
])
const { copy, showToast } = getApp()
Component({
  properties: {
    refundFlag: Number,
    orderStatus: Number
  },
  data: {
    _btn: '',
    _isShow: false,
    _title: '请使用Fabrique App完成退款',
    _content: '小程序退款功能正在开发中，复制链接后从浏览器中打开即可下载App',
    _dialog: false
  },
  observers: {
    refundFlag (val) {
      this.setData({ _btn: btnMaps.get(val) })
    },
    orderStatus(val) {
      this.setData({ _isShow: [2, 5, 6].includes(val) })
    }
  },
  methods: {
    tap () {
      // const { refundFlag } = this.properties
      this.setData({ _dialog: true })
    },
    onTap(e) {
      console.log(e)
      this.setData({ _dialog: false })
      const url = 'https://a.app.qq.com/o/simple.jsp?pkgname=com.cogo.fabrique'
      e.detail && copy(url).then(() => showToast('复制成功'))
    }
  }
});
