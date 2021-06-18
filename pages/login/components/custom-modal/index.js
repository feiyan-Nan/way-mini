// public/modal/modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '微信授权'
    },
    desc: {
      type: String,
      value: ''
    }
  },
  data: {
    isShow: false,
    isShowBg: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show() {
      this.setData({
        isShow: true
      })
    },
    hide() {
      this.setData({
        isShow: false
      })
    },
    getPhoneNumber(e) {
      this.triggerEvent('getPhoneNumHandle', e)
      this.hide()
    }
  }
})
