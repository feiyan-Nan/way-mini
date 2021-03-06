// pages/homepage/index.js
import { homePageApi } from '../../api/index';

const titles = ['乘坐线路', '想顺路'];
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
    orderNums: ['', ''],
    activeTab: 0,
    babyHeaderOpacity: 0,
    isLogged: false,
    nearList: [],
    _rate: 60,
    _currInfo: null,
    _isShowBtn: false,
    _route: null,
    _isShowMask: false,
    _lovemeBabys: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const tabs = titles.map((item) => ({ title: item }));
    this.setData({ tabs });
    this.getNearList()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const isLogged = isLogin();
    this.setData({ isLogged });
  },

  /*
    获取喜欢我的详情
  */
  async getLoveMeDetail () {
    const res = await homePageApi.getLoveMe({ type: 0, currentPage: 1 })
    console.log('res---------', res)
    const { c, d } = res
    if (c == 0) {
      this.setData({
        orderNums: ['', d.concernPeopleList.length],
        _lovemeBabys: d.concernPeopleList.filter(i => i.userJobTagDTO && i.userJobTagDTO.professionTags)
      })
    }
  },

  onChange({ detail }) {
    this.getLoveMeDetail()
  },

  login() {
    networkAct(async () => {
      surface(wx.reLaunch, {
        url: '/pages/start-page/index',
      });
    });
  },

  async showDetail ({ mark }) {
    const _currInfo = mark.info
    const { lineNo: path } = _currInfo
    const { cityName: location } = this.data._route
    try {
      wx.showLoading()
      const { c, d } = await homePageApi.getLineDetail({ location, path })
      if (c == 0) {
        _currInfo.ring = d
      }
      this.setData({ _currInfo } )

      wx.nextTick(() => {
        this.openMask()
      })

      wx.nextTick(() => {
        this.showCanvasRing()
      })
    } catch(err) {
      console.log('err', err)
    } finally {
      wx.hideLoading()
    }

  },

  async handleTap ({ mark }) {
    console.log('mark', mark)
    const { cityName: city } = this.data._route
    const res = await homePageApi.slip({ ...mark.info, city })
    console.log('res', res)

  },

  handleHide() {
    this.setData({
      _isShowMask: false
    })
    this.observe.disconnect()
  },

  openMask () {
    this.setData({
      _isShowMask: true
    }, () => {
      this.selectComponent('.pubmask').show()
      this.watchSite()
    })
  },


  /*
    获取附近的路线信息
  */
  async getNearList () {
    wx.showLoading()
    const route = this.memory_route || await getGaoDeRoute()
    this.memory_route = route
    this.lineNo = this.lineNo || this.chunkArr(route.lineNo, 5)

    const firstLineNo = this.lineNo.splice(0, 1).flat()

    if (!firstLineNo.length) {
      wx.hideLoading()
      return
    }

    route.lineNo = firstLineNo
    const res = await homePageApi.getNearList(route)
    wx.hideLoading()
    if (res.c == 0) {
      const list = res.d.list.map(i => Object.assign(i, { presonNo: i.userEachNearLineRespVos.length }))
      const nearList = this.data.nearList.concat(list)
      this.setData({
        nearList,
        _route: route
      })
    }
  },

  scrollToLower() {
    this.getNearList()
    console.log('scrollToLower')
  },

  chunkArr (arr, num) {
    const length = Math.ceil(arr.length / num)
    return [ ...new Array(length).keys() ].map(i => arr.splice(0, num))
  },

  toBabyPage ({ mark }) {
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
    this.observe = wx.createIntersectionObserver()
    this.observe.relativeToViewport().observe('.site', res => {
      this.setData({
        _isShowBtn: res.intersectionRatio
      })
    })
  },
});
