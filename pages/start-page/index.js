// pages/start-page/index.js
import { login } from '../../api/index';
const { surface, globalData, showToast } = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  async login(e) {
    const { type, detail, code } = e.detail;
    console.log('detail', e.detail);
    showToast('还没对接');
    return false;
    if (type != 'getuserinfo' || !detail.errMsg.endsWith('ok')) return;
    delete detail.errMsg;
    const params = { code, ...detail };
    const loading = this.selectComponent('#loading');
    this.setData({ _code: code }, () => loading.show());
    const res = await login.wechat_login(params);
    loading.hide();
    if (res.code == 2000) {
      const { data } = res;
      globalData.userInfo = data;
      wx.setStorageSync('userInfo', data);
      console.log('本地缓存写入成功', data);
      const _fresh = data.fresh;
      if (_fresh) {
        this.setData({ _fresh });
        return;
      }
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.emit('onLoginSucc', { data });
    }
    if (res.code == 2004) {
      this.selectComponent('.modal').show();
    }
    if (res.code == 5001) {
      console.log('登录失败', res);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

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
