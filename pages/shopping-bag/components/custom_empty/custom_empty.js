// pages/shopping-bag/components/custom_empty/custom_empty.js
Component({

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToIndex() {
      wx.switchTab({
        url: '/pages/home/index'
      })
    }
  }
})
