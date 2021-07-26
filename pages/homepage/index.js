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
    babyHeaderOpacity: 0,
    isLogged: false,
    nearList: [],
    _rate: 60,
    _currInfo: null,
    _isShowBtn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const tabs = titles.map((item) => ({ title: item }));
    this.setData({ tabs });
    this.getNearList()
    // this.selectComponent('.pubmask').show()
    this.showCanvasRing()

    this.watchSite()
    /*
      获取喜欢我的详情
    */
    this.getLoveMeDetail()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const isLogged = isLogin();
    this.setData({ isLogged });
  },

  async getLoveMeDetail () {
    const res = homePageApi.getLoveMe({ type: 0, currentPage: 1 })
    console.log('res---------', res)
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

  showDetail ({ mark }) {
    console.log('mark', mark)
    const { info: _currInfo } = mark
    this._currInfo = mark.info
    this.setData({
      _currInfo
    })
    this.selectComponent('.pubmask').show()
  },

  openMask () {
    this.selectComponent('.pubmask').show()
  },


  /*
    获取附近的路线信息
  */
  async getNearList () {
    wx.showLoading()
    const route = await getGaoDeRoute()
    const res = await homePageApi.getNearList(route)
    wx.hideLoading()
    console.log('res---------', res)
    if (res.c == 0) {
      this.setData({
        nearList: res.d.list.map(i => Object.assign(i, { presonNo: i.userEachNearLineRespVos.length }))
      })
    }
  },

  toBabyPage ({ mark }) {
    console.log(',ark', mark)
    networkAct(async () => {
      surface(wx.navigateTo, {
        url: '/pages/baby/index?id=' + mark.id,
      });
    });
  },

  showCanvasRing () {
    this.selectComponent(".canvasRing1").showCanvasRing()
    this.selectComponent(".canvasRing2").showCanvasRing()
    this.selectComponent(".canvasRing3").showCanvasRing()
    this.selectComponent(".canvasRing4").showCanvasRing()
  },

  watchSite () {
    wx.createIntersectionObserver().relativeToViewport().observe('.site', res => {
      console.log('res', res)
      this.setData({
        _isShowBtn: res.intersectionRatio
      })
    })
  }
});
