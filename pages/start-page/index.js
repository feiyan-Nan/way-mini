// pages/start-page/index.js
import { login } from '../../api/index';
const { surface, globalData, showToast } = getApp();
let phoneNumberInformation = null;
let jsCode = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showProtocol: false,
    /**
     * 是否阅读协议
     */
    haveYouReadTheAgreement: false,
  },
  disagree() {
    this.setData({
      showProtocol: false,
    });
  },
  async agree() {
    this.setData({
      showProtocol: false,
      haveYouReadTheAgreement: true,
    });
    // 登录
    const {
      d: { userInfo },
    } = await login.wechat_register({ jsCode, ...phoneNumberInformation });
    console.log(userInfo);
    const { newUser } = userInfo;
    globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
    // return false;
    newUser &&
      wx.navigateTo({
        url: '/pages/sex-select/index',
      });
    !newUser &&
      wx.switchTab({
        url: '/pages/homepage/index',
      });
  },
  async login(e) {
    console.log(e);
    const phoneInfo = e.detail.detail;
    if (!phoneInfo.errMsg.endsWith('ok')) {
      return false;
    }
    if (!this.data.haveYouReadTheAgreement) {
      this.setData({
        showProtocol: true,
      });
    }
    phoneNumberInformation = phoneInfo;
    // this.setData({ iv, encryptedData });
    // showToast('还没对接');
    // return false;
    // if (type != 'getuserinfo' || !detail.errMsg.endsWith('ok')) return;
    // delete detail.errMsg;
    // const params = { code, ...detail };
    // const loading = this.selectComponent('#loading');
    // this.setData({ _code: code }, () => loading.show());
    // const res = await login.wechat_login(params);
    // loading.hide();
    // if (res.code == 2000) {
    //   const { data } = res;
    //   globalData.userInfo = data;
    //   wx.setStorageSync('userInfo', data);
    //   console.log('本地缓存写入成功', data);
    //   const _fresh = data.fresh;
    //   if (_fresh) {
    //     this.setData({ _fresh });
    //     return;
    //   }
    //   const eventChannel = this.getOpenerEventChannel();
    //   eventChannel.emit('onLoginSucc', { data });
    // }
    // if (res.code == 2004) {
    //   this.selectComponent('.modal').show();
    // }
    // if (res.code == 5001) {
    //   console.log('登录失败', res);
    // }
  },

  handleCancel () {
    // console.log(888999)
    wx.reLaunch({
      url: '/pages/homepage/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const { code } = await surface(wx.login);
    jsCode = code;
    console.log(code, jsCode);
  }
});
