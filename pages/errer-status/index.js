import { orderApi } from '../../api/index';
const { surface, globalData } = getApp()

Page({
  data: {
    orderStatus: 0,
    params: null
  },
  onLoad: function (options) {
    console.log('optionsoptions', options)
    if (Object.keys(options).length) {
      this.setData({ params: options }, this.refresh)
      return
    }
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', params => this.setData({ params }, this.refresh))
  },
  async refresh () {
    const startTime = Date.now()
    while (Date.now() - startTime <= 16 * 1000 && !this.data.orderStatus) {
      const res = await orderApi.check_status(this.data.params)
      if (res.code == 2000) {
        const { orderStatus } = res.data
        this.setData({ orderStatus })
        if (orderStatus !== 0) return
        await this.sleep()
      }
    }
    this.setData({ orderStatus: 5 })
  },
  // 到订单详情
  goOrderDetails() {
    surface(wx.navigateTo, {
      url: '/pages/order-status/index'
    }).then(res => {
      res.eventChannel.emit('acceptDataFromOrderListPage', { ...this.data.params, delta: 2 })
    })
  },
  // 到首页
  goIndexPage() {
    wx.switchTab({
      url: '/pages/home/index'
    })
  },
  navigateBack () {
    if (this.data.orderStatus == 1) {
      console.log('globalData.birthPlace', globalData.birthPlace)
      const pages = getCurrentPages()
      console.log('pages', pages)
      const delta = pages.reverse().findIndex(item => item.is.includes(globalData.birthPlace))
      console.log('delta', delta)
      wx.navigateBack({ delta })
      return
    }
    wx.navigateBack()
  },
  sleep (time = 1000) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }
});
