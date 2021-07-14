// pages/homepage/index.js
import { homePageApi } from '../../api/index';

const titles = ['乘坐线路', '喜欢我'];
const {
  orderStatusMapFun,
  getGaoDeRoute,
  getLocationRight,
  debounce,
  formatTime,
  uid,
  surface,
  isLogin,
  networkAct,
  routingConfig: { orderStatus },
} = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [],
    orderNums: ['', 9],
    activeTab: 0,
    isLogged: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const tabs = titles.map((item) => ({ title: item }));
    this.setData({ tabs });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // getLocationRight();
    const isLogged = isLogin();
    this.setData({ isLogged });
    getGaoDeRoute().then((res) => {
      homePageApi.getNearList(res).then((result) => {
        console.log(result);
      });
      console.log('666', res);
    });
  },

  onChange({ detail }) {
    console.log('9999999999999', detail);
  },
  login() {
    networkAct(async () => {
      surface(wx.reLaunch, {
        url: '/pages/start-page/index',
      });
    });
  },
});
