// components/pub_mask/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    closable: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hidden: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show () {
      this.setData({
        hidden: false
      })
    },

    hide () {
      this.setData({
        hidden: true
      })
      this.triggerEvent('onhide')
    },

    tapBg() {
      this.triggerEvent('tapBg')
      this.properties.closable && this.hide()
    },

    toggle () {
      this.setData({
        hidden: !this.data.hidden
      })
    }
  }
})
