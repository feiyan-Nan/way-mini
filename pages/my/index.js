const { surface, getUserInfo, networkAct, isLogin } = getApp();
Page({
  data: {
    userInfo: null,
    backSrc: null,
    waitPayOrderNum: 0,
    waitReceivingGoodsNum: 0,
    isLogged: false,
    avatar: null,
    name: null,
    isShow: false,
    opacity: 0,
  },
  async onShow() {
    console.log('this.data', this.data);
    const userInfo = getUserInfo();
    const isLogged = isLogin();

    console.log('isLogged', isLogged)
    this.setData({ userInfo, isLogged });
  },

  toLoginPage () {
    surface(wx.navigateTo, { url: '/pages/start-page/index' })
  },

  handleEdit() {
    console.log('isLogin', isLogin())
    this.data.isLogged ? this.toEditPage() : this.toLoginPage()
  },

  toEditPage() {
    surface(wx.navigateTo, { url: '/pages/edituser/index' })
  },

  onShareAppMessage() {
    return {
      title: '邀好友顺路',
      path: '/pages/homepage/index',
    };
  },
});
