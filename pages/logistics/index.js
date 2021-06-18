// pages/logistics/index.js
import { logistics } from '../../api/index'
const { uid, copy, showToast } = getApp()
const qiyu_botton = require('../../behaviors/qiyu_botton')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {}
  },
  behaviors: [qiyu_botton],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { orderid: orderId } = options
    this.getDetail(orderId)
  },
  getDetail (orderId) {
    logistics.get_detail({
      uid: uid(),
      orderId
    }).then(res => {
      const { code, data: info } = res
      if (code === 2000) {
        console.log('info', info)
        this.setData({
          info
        })
      }
    })
  },
  goCopy () {
    copy(this.data.info.logisticNu).then((res) => showToast('已复制'));
  },
  goBack () {
    wx.navigateBack()
  }
})