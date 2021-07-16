// pages/sex-select/index.js
import { login } from '../../api/index';

const {
  showModal,
  getGaoDeRoute,
  getLocationRight,
  debounce,
  throttle,
  showToast,
  getWechatAddress,
  getPageInformation,
  routingConfig: { confirmOrder, shippingAddress },
  uid,
  globalData: { isX },
  getDetetailAddress,
} = getApp();
// ;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    date: '出生日期',
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
    });
  },
  foundSomeoneWhoWasInTheWay() {
    if (this.data.date === '出生日期') {
      wx.showModal({
        content: '您的出生日期还未填写哦！',
        showCancel: false,
        confirmText: '我知道了',
      });
    }
    // TODO 生日的数据类型没有确定
    login
      .update_user_info(
        { ...this.data.userInfo, birthday: this.data.date },
        { 'content-type': 'application/x-www-form-urlencoded' }
      )
      .then((res) => {
        getLocationRight().then((res) => {
          wx.switchTab({
            url: '/pages/homepage/index',
          });
        });
      });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptSexSelectPage', (data) => {
      console.log(data);
      this.setData({
        userInfo: data,
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
