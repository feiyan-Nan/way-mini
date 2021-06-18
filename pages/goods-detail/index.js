import { spuDetail, bag, orderApi } from '../../api/index';
const { surface, debounce, throttle, showToast, getUserInfo, checkConnected, routingConfig, globalData, uid } = getApp();
const { copy } = getApp();
let autoPlayList = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    scrollTop: 0, // 滚动距离顶部距离
    scrollY: true,

    /** --电梯相关 TODO 后续封装到页面组件-- */
    stickyOpacity: 0, // 电梯透明度
    stickyHeight: 44, // 电梯高度
    activeTab: 'single', // 电梯选中tab
    tabList: [
      { id: 'single', label: '单品' },
      { id: 'desginer', label: '设计师' },
      { id: 'detail_el', label: '详情' },
      { id: 'fabs', label: 'Fabs' },
    ],
    statusBarHeight: '',
    titleBarHeight: '',
    hideSticky: false,
    /** --电梯相关end-- */

    scrollIntoView: '', // 滚动到指定元素
    // shopCarNums: 0, // 购物袋数量
    swiperItem: [],
    previewItem: [],
    spuVideoCover: '',
    info: {},
    list: [], // 商品详情列表
    detailCover: '',
    hasCoverVideo: false,
    hasDetailVideo: false,
    hasDetailAutoPlay: false,
    sizeArr: [], // size Arr TODO 从后端后去
    sizeIndex: '',
    showStat: true, // 当前选中size
    serviceDescription: '专属Stylist·顺丰包邮·7天无理由', // 服务说明
    isLogged: false,
    systemInfo: {},
    showPreview: false,
    previewVideoType: 'top',
    previewVideoIndex: 0,
    currentSwiper: 0,
    fullScreen: false,
    showSystemControls: false,
    sizeChatUrl: null,
    sizeTips: null,
    display: false,
    sizeInfo: null,
    _type: 'all',
    _designer: null,
    _fabs: null,
    dialog: {
      _title: '请使用Fabrique App查看',
      _content: '在App中可查看设计师更多信息，复制链接后从浏览器中打开即可下载App',
      _dialog: false
    }
  },
  showDialog() {
    this.setData({
      'dialog._dialog': true
    })
  },
  onTap(e) {
    console.log(e)
    this.setData({ 'dialog._dialog': false })
    const url = 'https://a.app.qq.com/o/simple.jsp?pkgname=com.cogo.fabrique'
    e.detail && copy(url).then(() => showToast('复制成功'))
  },
  async init(firstLoad) {
    autoPlayList = {};
    this.initStickyTop();
    try {
      this.firstLoad = firstLoad;
      await this.getData();
      this.firstLoad = false;
    } catch (err) {
      console.error(err);
      this.selectComponent('#loading').hide();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    /*
    * 兼容一下进入平铺尺寸页面再回来的时候视频会自动播放问题
    * */
    const mask = this
      .selectComponent('.m-nav')
      .selectComponent('.m-mask')
      .selectComponent('.custom_mask')
    if (mask.data.shows.all) return


    const systemInfo = wx.getSystemInfoSync()
    const { windowWidth } = systemInfo
    const isX = globalData.isX;
    this.setData({
      isX,
      id: this.options.id,
      _videoHeight: windowWidth / 2 * 3,
      systemInfo
    });

    this.createSelectorQuery().select('.empty-view').boundingClientRect().exec(res => {
      console.log('empty-view判断', res)
      this.referenceWidht = res[0].width
      this.init(!this.isBack);
      this.getCarCount();
      this.isBack = false;
    })
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopPageVideo();
  },

  goTop() {
    this.setData({
      scrollTop: 0
    })
  },
  scroll: function ({ detail: { scrollTop } }) {

    if (scrollTop === 0) {
      this.setData({
        scrollTop,
        stickyOpacity: 0
      });

    }
    this.scrollTop = scrollTop < 100 ? 0 : scrollTop;
    this.pageScrollFn(this.scrollTop);
    setTimeout(() => {
      this.pageScrollFn(this.scrollTop);
    }, 100);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({ from, target, webViewUrl }) {
    const { id, swiperItem, info: { brand, designer, name } } = this.data;
    console.log('info---', this.data.info)
    const find = swiperItem.find(item => item.type === 'image' && item.src);
    const imageUrl = find ? find.src : '';
    // 跟测试沟通说去掉
    // showToast('分享成功');
    console.log(`/pages/goods-detail/index?id=${id}`)
    return {
      title: `${brand} ${designer} ${name}`,
      path: `/pages/goods-detail/index?id=${id}`,
      imageUrl
    }
  },
  /**
   * 用户点击右上角分享到朋友圈
   */
  onShareTimeline: function () {
    const { id, swiperItem, info: { brand, designer, name } } = this.data;
    const find = swiperItem.find(item => item.type === 'image' && item.src);
    const imageUrl = find ? find.src : '';
    // 跟测试沟通说去掉
    // showToast('分享成功');
    return {
      title: `${brand} ${designer} ${name}`,
      query: `id=${id}`,
      imageUrl
    }
  },
  /** --获取商详页面所需信息-- */
  async getData() {
    console.log('获取商详页面所需信息')
    const spuId = this.data.id
    this.selectComponent('#loading').show();
    const res = await spuDetail.getSpuDetail({ uid: uid() || '87955163', spuId });

    const fabsRes = await spuDetail.getFabs({
      uid: uid() || '87955163',
      spuId,
      pageNum: 1
    })

    const _fabs = fabsRes.data.slice(0, 5) || []
    console.log('_fabs-------', _fabs)

    const sizeInfo = await spuDetail.getSizeInfo({ spuId })
    this.setData({ sizeInfo: sizeInfo.data })

    const data = res.data || {};
    const { sizeChatUrl, sizeTips, designer } = data
    this.selectComponent('#loading').hide();
    const { windowWidth, windowHeight } = wx.getSystemInfoSync();
    const _designer = designer ? Object.assign({}, designer, { spuDesc: this._getNewDetailList(designer.spuDesc, windowWidth) }) : null;
    const newList = this._getNewDetailList(data.spuDescList, windowWidth)
    console.log('newList--------------', newList)
    this.setData({
      sizeChatUrl,
      sizeTips,
      swiperItem: this._getSwiperItem(data, windowWidth, windowHeight),
      list: newList,
      info: this._getSpuInfo(data),
      hasDetailVideo: data.hasDetailVideo,
      hasCoverVideo: data.hasCoverVideo,
      showStat: data.showStat && data.stockNum > 0,
      serviceDescription: data.serviceDescription,
      spuVideoCover: data.spuImagesUrlList && data.spuImagesUrlList.length ? data.spuImagesUrlList[0] : '',
      _designer,
      _fabs
    })
    const { networkType } = await surface(wx.getNetworkType);
    if (networkType === 'wifi' && this.data.hasCoverVideo && this.firstLoad) {
      this._getSwiperSingleTone().playVideo(0, this._getSwiperSingleTone());
    }
  },
  _getSwiperItem(data, windowWidth, windowHeight) {
    const result = (data.hasCoverVideo ? [JSON.parse(data.coverVideo)] : []).concat(data.spuImagesUrlList.filter((i, v) => !data.hasCoverVideo || v !== 0))
    return result
      .map((item, index) => {
        const isVideo = typeof item !== 'string';
        return {
          id: index,
          mode: 'aspectFill',
          type: isVideo ? 'video' : 'image',
          src: isVideo ? item.src : item,
          srcOrigin: isVideo ? '' : (data.spuOriginalImgUrlList || data.spuImagesUrlList)[index],
          width: isVideo ? '100%' : windowWidth + 'px',
          height: isVideo ? item.height * windowWidth / item.width + 'px' : '480px',
          coverImage: data.coverImage,
          isVideo,
          isPlay: false,
          isLoad: this.firstLoad ? false : true,
          scale: 1,
          defaultY: (windowHeight - 480) / 2,
          progress: 0,
          duration: isVideo ? item.time : 0
        };
      });
  },
  _getNewDetailList(data, windowWidth) {
    if (!data) return [];
    const systemInfo = wx.getSystemInfoSync()
    const num = systemInfo.model.includes('iPhone13') ? 3 : 0
    console.log('systemInfo----------', systemInfo)
    const paddingLeftRight = windowWidth / 375 * 20 * 2;// 详情左右padding40rpx
    return data.map(item => {
      return {
        type: item.type == 1 ? 'image' : 'video',
        src: item.src,
        width: '100%',
        widthOrigin: item.width,
        height: item.type == 0 ? Math.floor(item.height * (windowWidth - paddingLeftRight) / item.width) + 'px' : '',
        // height: item.type == 0 ? item.height * (windowWidth - paddingLeftRight) / item.width + 3 + 'px' : '',
        heightOrigin: item.height,
        coverImage: item.type == 0 ? item.coverImage : '',
        isLoad: this.firstLoad ? false : true,
        isPlay: false,
        duration: item.type == 0 ? item.time * 1000 : 0,
        direction: item.width > item.height ? 'hov' : 'ver',
        isVideo: item.type == 0,
        uuid: Math.random().toString(36).slice(-8),
        targetHeight: `${Math.ceil(item.height * windowWidth / item.width)}px;`,
        // videoHeight: `${Math.ceil(item.height * this.referenceWidht / item.width)}px;`
        videoHeight: item.type == 0 ? Math.floor(item.height * (windowWidth - paddingLeftRight) / item.width + num ) + 'px' : '',
        tmpHeight: `${Math.ceil(item.height * this.referenceWidht / item.width)}px;`,
      };
    })
  },
  _getSpuInfo(data) {
    return {
      brand: data.spuBrand,
      designer: 'with Fabrique',
      name: data.spuName,
      // 去掉本地处理
      // money: formatThousands(Number(data.minSkuPriceStr))
      money: '¥' + Number(data.minSkuPriceStr)
    }
  },
  _getSizeArr(data) {
    return data.skuInfoList.map(item => {
      return {
        ...item,
        name: item.specsValName1,
        id: item.skuId
      }
    })
  },
  async getCarCount(showLoading) {
    const userInfo = getUserInfo();
    if (!userInfo) {
      return;
    }
    if (!this.data.isLogged) {
      this.setData({
        isLogged: true
      });
    }
  },
  /** --获取商详页面所需信息end-- */
  /**
   * 详情，视频点击回调，修改isPlay，并操作视频播放/暂停 TODO 内部处理外部不管
   */
  detailTrogglePlay({ troggle, currentTarget: { id, dataset: { index, type } } }) {
    let key = "list";
    let data = this.data.list;
    if (type === "designer") {
      key = "_designer.spuDesc";
      data = this.data._designer.spuDesc;
    }
    this.setData({
      [`${key}[${index}].isPlay`]: typeof troggle !== 'boolean' ? !data[index].isPlay : troggle
    });
  },
  // 触发尺码选择弹框
  // handleShowSize() {
  //   if (this.data.sizeArr.length === 1) {
  //     this.setData({
  //       sizeIndex: "0"
  //     });
  //   }
  //   this.selectComponent('#m-bottom').showSize();
  // },
  handleShowSize() {
    if (this.data.sizeArr.length === 1) this.setData({ sizeIndex: "0" })
    this.setData({ display: true, _type: 'all' })
  },
  /**加入购物袋 */
  async handleAddCar({ detail: { index, data } }) {
    await checkConnected();
    const userInfo = getUserInfo();
    if (!userInfo) {
      this.pausePageVideo();
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc: (function () {
            surface(wx.navigateBack, { delta: 1 });
            this.handleAddCar({ detail: { index, data } });
          }).bind(this)
        }
      });
      return;
    }
    if (!this.data.isLogged) {
      this.setData({
        isLogged: true
      });
    }
    const { skuId, spuId } = data;
    this.selectComponent('#loading').show();
    const res = await bag.addToCart({
      uid: userInfo.uid,
      skuId, spuId,
      skuNum: 1
    });
    this.selectComponent('#loading').hide();
    if (res.code !== 2000) {
      // TODO 失败提示？
      showToast(res.msg)
      if (res.code === 3033) this.init();
      return;
    } else {
      showToast("已添加至购物袋");
    }
    this.selectComponent('#shopBag').upDateBagCount(true)
    this.getCarCount(true);
  },
  /** 立即购买 */
  async handlePay({ detail: { index, data } }) {
    globalData.birthPlace = 'goods-detail'
    await checkConnected();
    const userInfo = getUserInfo();
    if (!userInfo) {
      this.pausePageVideo();
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc: (function () {
            // showToast('登录成功之后回来')
            surface(wx.navigateBack, { delta: 1 }).then(() => {
              // showToast('继续去支付')
              this.handlePay({ detail: { index, data } })
            })
          }).bind(this)
        }
      });
      return;
    }
    if (!this.data.isLogged) {
      this.setData({
        isLogged: true
      });
    }
    this.selectComponent('#loading').show();
    const time = setTimeout(() => {
      this.selectComponent('#loading').hide();
    }, 10000);
    // 获取未支付订单
    const orderRes = await orderApi.getPayOrderNum({ uid: userInfo.uid }) || {};
    const { waitPayOrderNum } = orderRes.data || {};
    if (orderRes.code == 2000 && waitPayOrderNum >= 5) {
      showToast(`你还有${waitPayOrderNum}个未支付订单，请先去支付`);
      this.selectComponent('#loading').hide();
      return;
    } else if (orderRes.code != 2000) {
      return;
    }
    // 下单
    const { spuId, skuId } = data;
    const createOrderRes = await orderApi.createOrder({
      orderItems: [{
        spuId,
        skuId,
        num: 1
      }],
      uid: userInfo.uid
    });
    if (createOrderRes.code !== 2000) {
      showToast(createOrderRes.msg)
      this.selectComponent('#loading').hide()
      this.init()
      return;
    }
    // 校验完成，跳转确认订单页面
    this.pausePageVideo();
    // 跳转确认订单页面， emit acceptOrderSkuPage事件，传入商品信息
    const res = await surface(wx.navigateTo, {
      url: '/pages/confirm-order/index',
      events: {
        createOrderError: (msg) => {
          showToast(msg);
          this.init()
        }
      }
    });
    res.eventChannel.emit('acceptOrderSkuPage', {
      orderItems: [{
        spuId,
        skuId,
        num: 1
      }],
      uid: userInfo.uid
    });
    clearTimeout(time);
    this.selectComponent('#loading').hide();
  },

  /** 加入购物袋最新方法 **/
  async addCar(e) {
    console.log('e  addCar', e.detail)
    await checkConnected()
    const userInfo = getUserInfo()
    console.log('userInfo', userInfo)
    if (userInfo) {
      const { skuId, spuId } = e.detail.curr
      const { uid } = userInfo
      const skuNum = 1
      this.selectComponent('#loading').show();
      const res = await bag.addToCart({ uid, skuId, spuId, skuNum });
      this.selectComponent('#loading').hide();
      if (res.code !== 2000) {
        // TODO 失败提示？
        showToast(res.msg)
        if (res.code === 3033) this.init();
        return;
      } else {
        showToast("已添加至购物袋");
        this.setData({ display: false })
        this.selectComponent('#shopBag').upDateBagCount()
      }
    } else {
      this.pausePageVideo();
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc: (function () {
            surface(wx.navigateBack, { delta: 1 });
            this.addCar(e);
            wx.nextTick(() => {
              this.init(true)
            })
          }).bind(this)
        }
      });
    }
  },

  /** 立即购买最新方法 **/
  async buy(e) {
    console.log('buy', e)
    globalData.birthPlace = 'goods-detail'
    await checkConnected();
    const userInfo = getUserInfo();
    if (!userInfo) {
      this.pausePageVideo();
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc: (function () {
            // showToast('登录成功之后回来')
            surface(wx.navigateBack, { delta: 1 }).then(() => {
              // showToast('继续去支付')
              this.buy(e)
            })
          }).bind(this)
        }
      });
      return;
    }

    this.selectComponent('#loading').show();
    const time = setTimeout(() => {
      this.selectComponent('#loading').hide();
    }, 10000);

    // 获取未支付订单
    const orderRes = await orderApi.getPayOrderNum({ uid: userInfo.uid }) || {};
    const { waitPayOrderNum } = orderRes.data || {};
    if (orderRes.code == 2000 && waitPayOrderNum >= 5) {
      showToast(`你还有${waitPayOrderNum}个未支付订单，请先去支付`);
      this.selectComponent('#loading').hide();
      return;
    } else if (orderRes.code != 2000) {
      return;
    }

    // 下单
    const { spuId, skuId } = e.detail.curr;
    const num = 1
    const { uid } = userInfo
    const orderItems = [{ spuId, skuId, num }]
    const createOrderRes = await orderApi.createOrder({ orderItems, uid })
    if (createOrderRes.code !== 2000) {
      showToast(createOrderRes.msg)
      this.selectComponent('#loading').hide()
      this.init()
      return;
    }
    // 校验完成，跳转确认订单页面
    this.pausePageVideo();
    // 跳转确认订单页面， emit acceptOrderSkuPage事件，传入商品信息
    const res = await surface(wx.navigateTo, {
      url: '/pages/confirm-order/index',
      events: {
        createOrderError: (msg) => {
          showToast(msg);
          this.init()
        }
      }
    });
    res.eventChannel.emit('acceptOrderSkuPage', { orderItems, uid });
    clearTimeout(time);
    this.selectComponent('#loading').hide();
    this.setData({ display: false })
  },


  /** ------------电梯相关-------------- */
  initStickyTop() {
    const menuRect = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    // 定义导航栏的高度   方便对齐
    this.setData({
      statusBarHeight,
      titleBarHeight: menuRect.height + 2 * (menuRect.top - statusBarHeight),
    });
  },
  /** 点击电梯按钮，触发页面滚动到指定位置 */
  async changeScroll({ currentTarget: { dataset: { type } } }) {
    console.log(type)
    // return
    let scrollTop = 0;
    if (type === 'single') {
      this.setData({
        hideSticky: true
      });
      this.setData({
        scrollTop: 0,
        hideSticky: false
      });
    } else {
      // const res = await this._getElExec('detail_el');
      const res = await this._getElExec(type);
      // console.log('res-------------------------------', res)
      scrollTop = this.scrollTop + res[0].top - this.data.statusBarHeight - this.data.titleBarHeight - this.data.stickyHeight;
      this.setData({
        scrollTop,
        activeTab: type
      });
    }
    this.stopPageScrollFn = true;
    setTimeout(() => {
      this.stopPageScrollFn = false;
      this.pageScrollFn(scrollTop);  // 防止特殊情况，activeTab错误
    }, 400);
    // setTimeout(() => {
    //   this.stopPageScrollFn = false;
    //   this.pageScrollFn(scrollTop);  // 防止特殊情况，activeTab错误
    // }, 600);
  },

  db: debounce(function (fn) {
    fn && fn()
  }, 80),
  compatibleFabs: debounce(function(fn) {
    fn && fn()
  }, 100),

  /**页面滚动的时候，处理视频播放暂停和电梯active的业务逻辑 */
  pageScrollFn: throttle(async function (scrollTop) {
    const activeTab = scrollTop < 500 ? 'single' : this.data.activeTab
    const stickyOpacity = scrollTop > 200 ? 1 : scrollTop / 200
    const params = Object.assign({}, this.data.activeTab != activeTab ? { activeTab } : null, this.data.stickyOpacity != stickyOpacity ? { stickyOpacity } : null)
    this.setData(params);
    // 滚动距离超过100，暂停banner视频
    if (scrollTop > this.data._videoHeight - 200 && this.data.hasCoverVideo) {
      this._getSwiperSingleTone().pauseVideo(0, this._getSwiperSingleTone());
    }
    /*
    * 滚动时候电梯切换
    */

    const topBarHeight = this.data.statusBarHeight + this.data.titleBarHeight + this.data.stickyHeight;

    this.db(() => {
      wx.createIntersectionObserver(this, {
        observeAll: true
      })
        .relativeToViewport()
        // .relativeTo('.sticky')
        .observe('.goods-detail', res => {
          // console.log('res---------------', res)
          const { id, intersectionRect: { top }, intersectionRatio } = res
          this.db(() => {
            if (intersectionRatio == 1 && id == 'fabs') {
              this.setData({ activeTab: 'fabs' })
              return
            }


            let setId = id;
            if (id === 'fabs' && top < 500) {
              // fabs标签 出现就修改电梯
            } else if (top > topBarHeight + 20) {
              const lastTabIndex = this.data.tabList.findIndex(item => item.id === id);
              setId = lastTabIndex ? this.data.tabList[lastTabIndex - 1].id : this.data.tabList[0].id;
            }
            if (setId !== this.data.activeTab && !this.stopPageScrollFn) this.setData({ activeTab: setId })
          })
        })
    })




    // 没有详情视频，只处理电梯activeTab
    //   wx.createIntersectionObserver().relativeToViewport().observe('#detail_el', async (res) => {
    //     const detailPadTop = res.intersectionRect.top - this.data.statusBarHeight - this.data.titleBarHeight - this.data.stickyHeight;
    //     this.setData({
    //       activeTab: detailPadTop > 100 ? 'single' : 'detail'
    //     });
    //   })
    // **********************
    const { networkType } = await surface(wx.getNetworkType);
    const { windowHeight } = this.data.systemInfo
    // 监听视频是否滑动到可视区域
    wx.createIntersectionObserver(this, {
      observeAll: true
    }).relativeToViewport()
      .observe('.custom_mask', async res => {
        const { id, boundingClientRect: { top, bottom, height } } = res
        const halfHeight = height * 0.5
        const component = this.selectComponent(`#${id}`)
        const isInShowArea = bottom >= halfHeight && bottom <= windowHeight + halfHeight
        if (networkType === 'wifi') {
          if (isInShowArea) {
            if (!autoPlayList[id]) {
              component.play()
            }
          } else {
            component.pause()
          }
        } else {
          !isInShowArea && component.pause()
        }
      })
  }, 90),
  /** 获取节点属性 */
  _getElExec(el) {
    const query = wx.createSelectorQuery()
    query.select('#' + el).boundingClientRect()
    query.selectViewport().scrollOffset()
    return new Promise(resolve => query.exec(resolve))
  },
  /** ------------电梯相关end-------------- */

  /** 获取swiper 组件，单例模式 */
  _getSwiperSingleTone() {
    if (!this.swiperComponent && this.data.hasCoverVideo) {
      this.swiperComponent = this.selectComponent('#swiper');
    }
    return this.swiperComponent;
  },
  /** 获取详情视频组件 */
  _getDetailVideoSingleTone() {
    if (!this.detailVideo && this.data.hasDetailVideo) {
      // this.detailVideo = this.selectComponent('#detail0');
      this.detailVideo = this.selectAllComponents('.custom_mask');
    }
    return this.detailVideo;
  },
  /** 暂停播放所有视频 */
  pausePageVideo() {
    if (this.data.hasDetailVideo) this._getDetailVideoSingleTone().map(item => item.pause());
    if (this.data.hasCoverVideo) this._getSwiperSingleTone().pauseVideo(0, this._getSwiperSingleTone());
  },
  /** 停止播放所有视频 */
  stopPageVideo() {
    if (this.data.hasCoverVideo) this._getSwiperSingleTone().stopVideo(0, this._getSwiperSingleTone());
    if (this.data.hasDetailVideo) this._getDetailVideoSingleTone().map(item => item.stop());
  },
  /** 图片加载 */
  load({ currentTarget: { dataset: { index } } }) {
    this.setData({
      [`list[${index}].isLoad`]: true
    });
  },
  /** 跳转到购物袋逻辑 */
  async goToBag() {
    await checkConnected();
    this.pausePageVideo();
    const userInfo = getUserInfo()
    if (userInfo) {
      if (!this.data.isLogged) {
        this.setData({
          isLogged: true
        });
      }
      surface(wx.navigateTo, { url: '/pages/shopping-bag/index' })
    } else {
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc() {
            surface(wx.redirectTo, { url: '/pages/shopping-bag/index' })
          }
        }
      })
    }
  },
  /**
   * 顶部视频全屏按钮
   */
  handleShowPreview() {
    this.setData({
      previewItem: this.selectComponent('#swiper').data.swiperItem.map((item) => {
        if (item.isVideo) {
          item.initialTime = item.duration / 1000 * item.progress / 100;
          return item;
        } else {
          return item;
        }
      }),
      showPreview: true,
      previewVideoType: 'top',
      previewVideoIndex: 0
    });
    this.stopPageVideo();
  },
  /**
   * 退出全屏，同步视频状态
   */
  handleHidePreview({ detail }) {
    const { type, isPlay, direction } = detail[0];
    const index = this.data.previewVideoIndex;
    if (type === 'video') {
      const { progress, duration } = detail[0];
      console.log(progress, duration, isPlay, type, duration / 1000 * progress / 100)
      detail[0].initialTime = duration / 1000 * progress / 100;
      if (this.data.previewVideoType === 'top') {
        this.selectComponent("#swiper").setData({
          swiperItem: detail,
        });
        this.stopPageVideo();
        this.data.systemInfo.platform !== 'android' && this._getSwiperSingleTone().seekVideo(0, detail[0].initialTime);
        if (isPlay) this._getSwiperSingleTone().playVideo(0);
      } else {
        this.data.list[index].initialTime = detail[0].initialTime;
        let key = this.data.previewVideoType === 'detail' ? 'list' : '_designer.spuDesc';
        console.log(this.data.list, this.data._designer.spuDesc)
        this.setData({
          [`${key}[${index}].initialTime`]: detail[0].initialTime,
          [`${key}[${index}].isPlay`]: isPlay
          // list: this.data.list
        });
        this.stopPageVideo();
        this.data.systemInfo.platform !== 'android' && this.selectComponent(`#${this.data.previewVideoType}${index}`).videoContext.seek(detail[0].initialTime)
        if (isPlay) {
          this.selectComponent(`#${this.data.previewVideoType}${index}`).play();
        }
      }

    }
    this.setData({
      showPreview: false,
      scrollY: true
    });
  },
  clickOther({ detail: { isPlay, showOptions, fullScreen }, currentTarget: { dataset: { index, type } } }) {
    if (fullScreen) return;
    const detial = this.selectComponent(`#${type}${index}`);
    if (!autoPlayList[`${type}${index}`]) {
      autoPlayList[`${type}${index}`] = true;
    }
    if (isPlay) {
      detial.pause()
    } else {
      detial.play()
    }
  },
  /**
   * 底部详情和设计师视频全屏按钮
   *
   */
  handleFullScreen({ detail, currentTarget: { dataset: { index, type } } }) {
    // 判断横竖类型视频
    const { windowWidth } = this.data.systemInfo
    let data = this.data.list;
    if (type === "designer") {
      data = this.data._designer.spuDesc;
    }
    if (data[index].direction === 'ver') {
      this.setData({
        previewItem: data.slice(index, index + 1).map(item => {
          console.log(item)
          return {
            ...item,
            height: item.heightOrigin * windowWidth / item.widthOrigin + 'px',
            initialTime: item.duration * item.progress / 100
          };
        }),
        showPreview: true,
        previewVideoType: type,
        previewVideoIndex: index
      });
      this.stopPageVideo();
      return;
    }
    if (detail) {
      this.tmpScrollTop = this.scrollTop;
    }
    this.setData({
      fullScreen: detail,
      showSystemControls: detail
    });
    if (!detail) {
      setTimeout(() => {
        this.setData({
          scrollTop: this.tmpScrollTop
        });
      }, 500);
    } else {
      setTimeout(() => {

      }, 500);
    }
  },
  handleProgressChange({ detail, currentTarget: { dataset: { index, type } } }) {
    let key = "list";
    if (type === "designer") {
      key = "_designer.spuDesc";
    }
    this.setData({
      [`${key}[${index}].progress`]: detail
    });
  },
  /** 返回上一级 */
  back({ detail }) {
    if (getCurrentPages().length > 1) wx.navigateBack(detail);
    else surface(wx.reLaunch, {
      url: routingConfig.home
    });
  },

  // handleLeftButtonClick() {
  //   this.setData({ display: true })
  // },
  handleRightButtonClick() {
    console.log('handleLeftButtonClick')
  }
});