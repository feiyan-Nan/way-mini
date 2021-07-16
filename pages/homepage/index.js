// pages/homepage/index.js
import { homePageApi, bag } from '../../api/index';
const titles = ['乘坐线路', '喜欢我'];
const {
  orderStatusMapFun,
  getGaoDeRoute,
  debounce,
  formatTime,
  uid,
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
    babyHeaderOpacity: 0
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
    getGaoDeRoute().then((res) => {
      homePageApi.getNearList(res).then((result) => {
        console.log(result);
      });
      console.log('666', res);
    });
  },

  onChange ({ detail }) {
    console.log('9999999999999', detail)
  },

  loadHandle() {
    console.log('loadHandle')
    this.setData({
      babyHeaderOpacity: 1
    })
  }
});
