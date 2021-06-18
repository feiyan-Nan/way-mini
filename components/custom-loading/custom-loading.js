Component({
  properties: {
    text: {
      type: String,
      value: '加载中…'
    }
  },
  data: {
    isShow: false,
    size: 200,
    opacity: 0,
    bgColor: null
  },
  methods: {
    show (params = {}) {
      this.setData({
        ...params,
        isShow: true
      })
    },
    toggle (params = {}) {
      this.setData({
        ...params,
        isShow: !this.data.isShow,
      })
    },
    hide (params = {}) {
      this.setData({
        ...params,
        isShow: false,
      })
    }
  }
});
