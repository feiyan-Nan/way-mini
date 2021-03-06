// pages/sex-select/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // true表示男,
    sex: true,
    canIUseGetUserProfile: false,
  },

  selectMale() {
    this.setData({
      sex: true,
    });
  },
  selectFeMale() {
    this.setData({
      sex: false,
    });
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.navigateToTheNextPage(res.userInfo);
      },
    });
  },
  getUserInfo(e) {
    this.navigateToTheNextPage(e.detail.userInfo);
    // wx.setStorageSync('wx-userInfo', e.detail.userInfo);
  },
  navigateToTheNextPage(data) {
    console.log(data);
    wx.navigateTo({
      url: '/pages/fill-birthday/index',
      success: (res) => {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptSexSelectPage', {
          avatar: data.avatarUrl,
          nickname: data.nickName,
          gender: this.data.sex ? 1 : 0,
        });
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
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
