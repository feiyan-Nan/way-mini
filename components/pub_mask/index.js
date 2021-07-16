// components/pub_mask/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    },

    toggle () {
      this.setData({
        hidden: !this.data.hidden
      })
    }
  }
})
