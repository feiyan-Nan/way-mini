import { homeApi, bag } from "../../api/index";
const { getUserInfo, surface, formatThousands, checkConnected, showToast, routingConfig: {webview, goodsDetail} } = getApp()
const defaultPageOptions = {
  current: 1,
  size: 20,
  empty: false
};
let tmpScrollTop = 0;
Page({
  data: {
    swiperItem: [], // 轮播图// 商品详情，测试用
    goodsItems: [], // 商品列表
    tmpGoodsItems: [], // 预加载商品列表
    shopCarNums: 0, // 购物车数量
    pageOptions: JSON.parse(JSON.stringify(defaultPageOptions)),
    scrollTop: 0,
    autoplay: false,
    noConnected: false,
    tabBarHeight: 0
  },
  onLoad(e) {
    let systemInfo = wx.getSystemInfoSync()
	  // px转换到rpx的比例
    let pxToRpxScale = 750 / systemInfo.windowWidth;
    // 状态栏的高度
    let ktxStatusHeight = systemInfo.statusBarHeight * pxToRpxScale
    // 导航栏的高度
    let navigationHeight = 44 * pxToRpxScale
    // window的宽度
    let ktxWindowWidth = systemInfo.windowWidth * pxToRpxScale
    // window的高度
    let ktxWindowHeight = systemInfo.windowHeight * pxToRpxScale
    // 屏幕的高度
    let ktxScreentHeight = systemInfo.screenHeight * pxToRpxScale
    // 底部tabBar的高度
    let tabBarHeight = ktxScreentHeight - ktxStatusHeight -ktxWindowHeight;
    this.setData({
      tabBarHeight
    })
    this.init(true);
  },
  async onShow() {
    this.setData({
      autoplay: true
    })
  },
  onHide() {
    this.setData({
      autoplay: false
    });
  },
  refresh() {
    this.init(false);
  },
  async init(hideToast) {
    try {
      await checkConnected(hideToast);
    } catch(err) {
      this.setData({
        noConnected: true
      });
      return;
    }
    const menuRect = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    // 定义导航栏的高度   方便对齐
    this.setData({
      statusBarHeight,
      titleBarHeight: menuRect.height + 2 * (menuRect.top - statusBarHeight),
      pageOptions: JSON.parse(JSON.stringify(defaultPageOptions))
    });
    this.selectComponent('#loading').show();
    this.getSwiper();
    try {
      await this.getData();
    } catch (err) {
      console.error('初始化接口失败', err);
      this.selectComponent('#loading').hide();
    }
  },
  async getSwiper() {
    const res = await homeApi.getBannerList();
    // const res = [1, 2, 3].map((item, index) => ({
    //   mode: 'aspectFill',
    //   bannerId: index, //	number	    必须        bannerId
    //   bannerImg: 'https://res.wx.qq.com/wxdoc/dist/assets/img/0.4cb08bb4.jpg', //	string	    必须    图片url
    //   id: index, //	number	    必须  id
    //   score: index, //	number	    必须    权重分数，分数越大越靠前。返回的List中已排序
    //   url: index % 2 ? '/pages/goods-detail/index' : 'https://www.baidu.com',//	string	    必须    跳转的链接
    //   type: index % 2,	//number	    必须 跳转标识，0：h5页面，1：商品详情页
    //   spuId: index //	string	 必须 spuId debugger
    // }));
    this.setData({
      swiperItem: res.data
    });
  },
  async getData() {
    if (this.data.pageOptions.current > 2 && !this.data.tmpGoodsItems.length) {
      this.selectComponent('#loading').show();
      return;
    }
    await this.awaitSeconds(200)
    if (this.data.pageOptions.current > 1) {
      this.setData({
        goodsItems: this.data.goodsItems.concat(this.data.tmpGoodsItems),
        tmpGoodsItems: []
      });
    }
    const res = await homeApi.getSpuList({pageNum: this.data.pageOptions.current});
    res.data = res.data.map((item) => {
      item.minSkuPriceStr = formatThousands(item.minSkuPriceStr);
      return item;
    })
    this.selectComponent('#loading').hide();
    if (res.code !== 2000) {
      wx.showToast({title: res.msg});
      return;
    }
    if (!res.data || !res.data.length) {
      this.setData({
        ['pageOptions.empty']: true
      });
    }
    const resData = res.data;
    console.log('resData---------', resData)
    // 首页第一页数据加载完后，立马加载第二页
    if (this.data.pageOptions.current === 1) {
      this.setData({
        ['pageOptions.current']: ++this.data.pageOptions.current,
        goodsItems: this.data.goodsItems.concat(resData)
      });
      this.getData();
      this.selectComponent('#loading').hide();
    } else {
      this.setData({
        // scrollTop: this.data.pageOptions.current === 2 ? tmpScrollTop : tmpScrollTop + 200, // 获取第二页不滚动
        ['pageOptions.current']: ++this.data.pageOptions.current, // 页码加一
        // goodsItems: this.data.goodsItems.concat(this.data.tmpGoodsItems),
        tmpGoodsItems: resData
      });
    }
  },
  async clickGoods({ currentTarget: { dataset: { item } } }) {
    await checkConnected();
    wx.navigateTo({
      url: `/pages/goods-detail/index?id=${item.spuId}&spuImages=${item.spuImages}`
    });
  },

  upper(e) {
    // console.log(e)
  },
  async lower(e) {
    // console.log('scrolltolower', e)
    await checkConnected();
    if (!this.data.pageOptions.empty && e.type === "scrolltolower") {
      this.getData();
    }
  },
  scroll({ detail: { scrollTop, scrollHeight } }) {
    // console.log(scrollTop, scrollHeight, scrollHeight - scrollTop);
    tmpScrollTop = scrollTop;
  },
  /** 点击顶部轮播图 */
  async clickSwiperItem({detail: {index} }) {
    await checkConnected();
    const item = this.data.swiperItem[index];
    if (item.type == '1' && item.spuId) {
      wx.navigateTo({
        url: goodsDetail + '?id=' + item.spuId
      });
    } else if (item.type == '0' && item.url) {
      wx.navigateTo({
        url: webview + '?src=' + item.url
      });
    }
  },
  async goToBag () {
    await checkConnected();
    const userInfo = getUserInfo()
    if (userInfo) {
      surface(wx.navigateTo, {url: '/pages/shopping-bag/index'})
    } else {
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc() {
            surface(wx.redirectTo, {url: '/pages/shopping-bag/index'})
          }
        }
      })
    }
  },

  async goToMap () {
    await checkConnected();
    surface(wx.navigateTo, {url: '/pages/map/index'})
  },

  async awaitSeconds(seconds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds)
    })
  },
  async test() {
    if (this.data.pageOptions.current > 2 && !this.data.tmpGoodsItems.length) {
      this.selectComponent('#loading').show();
      return;
    }
    await this.awaitSeconds(1000)
    if (this.data.pageOptions.current > 1) {
      this.setData({
        goodsItems: this.data.goodsItems.concat(this.data.tmpGoodsItems),
        tmpGoodsItems: []
      });
    }
    const res = await homeApi.getSpuList({pageNum: this.data.pageOptions.current});
    res.data = res.data.map((item) => {
      item.minSkuPriceStr = formatThousands(item.minSkuPriceStr);
      return item;
    })
    this.selectComponent('#loading').hide();
    if (res.code !== 2000) {
      wx.showToast({title: res.msg});
      return;
    }
    if (!res.data || !res.data.length) {
      this.setData({
        ['pageOptions.empty']: true
      });
    }
    // 模拟接口数据
    // const resData = new Array(20).fill(1).map((item, idx) => {
    //   const index = this.data.goodsItems.length + idx;
    //   return {
    //     ...this.data.goodsItem,
    //     spuId: index
    //   };
    // });
    const resData = res.data;
    // 首页第一页数据加载完后，立马加载第二页
    if (this.data.pageOptions.current === 1) {
      this.setData({
        ['pageOptions.current']: ++this.data.pageOptions.current,
        goodsItems: this.data.goodsItems.concat(resData)
      });
      this.getData();
      this.selectComponent('#loading').hide();
    } else {
      this.setData({
        scrollTop: this.data.pageOptions.current === 2 ? tmpScrollTop : tmpScrollTop + 200, // 获取第二页不滚动
        ['pageOptions.current']: ++this.data.pageOptions.current, // 页码加一
        // goodsItems: this.data.goodsItems.concat(this.data.tmpGoodsItems),
        tmpGoodsItems: resData
      });
    }
  },
  goTop () {
    this.setData({
      scrollTop: 0
    })
  },
  onShareAppMessage () {
    const [ first ] = this.data.goodsItems
    const { spuBrand, brandSuffix, spuName } = first
    const title = `${spuBrand} ${brandSuffix} ${spuName}`
    return {
      title,
      path: '/pages/home/index'
    }
  }
})
