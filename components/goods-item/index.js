// pages/home/components/goods-item/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String,
    topText: String,
    goodsName: String,
    money: String,
    index: Number,
    fill: Boolean,
    stockNum: Number,
    // 兼容gather页面
    isShowCoverImg: {
      type: Boolean,
      value: true
    }
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      // console.log(this.data.index % 8 === 0 || this.data.index % 8 === 3)
      const { index, stockNum, isShowCoverImg } = this.properties
      const isShowQing = isShowCoverImg ? (stockNum == 0 && !(index % 8 === 0 || index % 8 === 3) ? 'shouqing': undefined) : (stockNum == 0 ? 'shouqing': undefined)
      const isBlock = (this.data.index % 8 === 0 || this.data.index % 8 === 3) && isShowCoverImg
      const isLeft = isBlock ? 'mr-left' : null

      this.setData({
        isBlock,
        isLeft,
        isShowQing
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    isBlock: false,
    isShowQing: '',
    isLeft: null
  }
})
