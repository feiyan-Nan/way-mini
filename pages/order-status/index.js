const {
  copy,
  formatCountDown,
  formatTime,
  getUserInfo,
  surface,
  showToast,
  debounce,
  throttle,
  networkAct,
  globalData,
  uid,
  checkIsX,
  routingConfig: { goodsDetail },
} = getApp();
const qiyu_botton = require('../../behaviors/qiyu_botton')
import { orderApi } from '../../api/index';
Page({
  behaviors: [qiyu_botton],
  data: {
    params: null,
    desc: null,
    orderItems: [],
    orderInfo: null,
    orderStatus: null,
    orderTime: '',
    delta: 1,
    title: '',
    warningText: null,
    orderState: null,
    showMark: true,
    isShowBtnBox: false,
    paddingBottom: '',
    userRemark: '',
    _isX: false
  },
  onShow() {
    const { showMark } = this.data
    if (!showMark) {
      console.log('onShow')
      this.setData({ showMark: true }, this.reload)
    }
  },
  onHide () {
    console.log('hide')
    this.setData({ showMark: false })
  },
  onLoad: function (options) {
    this.setData({
      _isX: checkIsX()
    })
    if (Object.keys(options).length) {
      Object.assign(options, { uid: uid() })
      this.setData({ params: options }, this.getOrderDetail.bind(this, options))
      return
    }


    const pages = getCurrentPages();
    const { route } = pages[pages.length - 2];
    console.log('route ******', route);
    let delta = this.data.delta;
    const specialRoutes = ['/pages/order-status/index'];
    if (specialRoutes.includes(route)) {
      delta = 2;
    }
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOrderListPage', ({ ...params }) => {
      console.log('params***', params);
      this.setData({ params, delta }, this.getOrderDetail.bind(this, params));
    });
    // this.getOrderDetail(params)
  },
  orderNumberCopy() {
    copy(this.data.orderInfo.orderId).then((res) => showToast('已复制'));
  },
  async getOrderDetail(params) {
    // const data = {
    //   uid: "26832375",
    //   orderId: "1308978694018043904"
    // }
    this.setData({ orderInfo: null })
    const res = await orderApi.getorderDetail(params);
    this.setData({ loading: false })
    if (res.code != 2000) return;
    console.log('res', res.data);
    const { orderStatus, orderItems, userRemark, ...orderInfo } = res.data;
    const isShowBtnBox = [ 5, 6].includes(orderStatus)
    console.log('isShowBtnBox', isShowBtnBox)
    const paddingBottom = 'padding-bottom:' + [1, 5, 6].includes(orderStatus) ? '328rpx' : '128rpx'
    this.setData({ isShowBtnBox, paddingBottom, userRemark })


    const descs = [
      {},
      {
        title: '待支付',
        solgon: '',
      },
      {
        title: '待发货',
        solgon: '订单已提交，将尽快发出',
      },
      {
        title: '已取消',
        solgon: '订单超时取消，请重新下单',
      },
      {
        title: '异常',
        solgon: '',
      },
      {
        title: '待收货',
        solgon: '已发货，下载Fabrique App享受专属Stylist服务，查询详细订单动态',
      },
      {
        title: '交易成功',
        solgon: '订单已完成，去跟大家分享你的搭配灵感吧',
      },
    ];
    const desc = descs[orderStatus];
    if (orderStatus == 1) {
      desc.solgon = formatCountDown(orderInfo.residueTime);
    }
    console.log('desc', desc)
    const orderTime = formatTime(Number(orderInfo.orderTime), true);
    const data = { desc, orderItems, orderInfo, orderStatus, orderTime };
    this.setData({
      desc,
    });
    // this.setData(data, orderStatus == 1 ? this.reFreshTime.bind(this, this) : null);
    this.setData(data, () => {
      if (orderStatus == 1) {
        if (Number(orderInfo.residueTime) == 0) {
          console.log('兼容处理')
          return
        }
        this.reFreshTime(this)
      }
    })
  },
  onPageScroll(e) {
    const title = e.scrollTop >= 30 ? this.data.desc.title : '';
    if (title != this.data.title) this.setData({ title })
  },
  reFreshTime(that) {
    if (that.data.orderStatus != 1) return
    const residueTime = Number(that.data.orderInfo.residueTime);
    const solgon = formatCountDown(residueTime);
    const newResidueTime = residueTime - 1;
    const data = {
      'desc.solgon': solgon,
      'orderInfo.residueTime': newResidueTime,
    };
    that.setData(data, () => {
      if (newResidueTime <= 0) {
        that.reload()
      } else {
        console.log('继续跑秒')
        const timer = setTimeout(() => {
          if (that.data.showMark) {
            that.reFreshTime(that)
          } else {
            console.log('跑秒暂停')
          }
          clearTimeout(timer)
        }, 1000)
      }
    });
  },
  reload() {
    this.getOrderDetail(this.data.params);
  },
  navigateBack() {
    const pages = getCurrentPages()
    const delta = pages.reverse().findIndex(item => item.is.includes(globalData.birthPlace))
    wx.navigateBack({ delta: delta == -1 ? 0 : delta })
  },

  handleBottomButtonClick: throttle(async function() {
    console.log('handleBottomButtonClick');
    const { orderInfo, orderItems } = this.data;
    const res = await orderApi.orderPay({
      ...orderInfo,
      payMoney: orderInfo.totalPriceRmb,
      orderItems,
    });
    if (res.code != 2000) {
      // showToast(res.msg);
      const orderState = res.code
      const warningText = res.msg
      this.setData({ orderState, warningText })
      return;
    }
    const { orderId } = this.data.orderInfo;
    const params = {
      package: res.data.packageName,
      timeStamp: res.data.timestamp,
      ...res.data,
      orderId
    };
    delete params.packageName;
    console.log('请求的参数', params)

    wx.requestPayment({
      ...params,
      async success(response) {
        const { uid } = getUserInfo();
        jumpRes.eventChannel.emit('acceptDataFromOpenerPage', { uid, orderId });
      },
      fail(error) {
        // 支付失败
        console.log('支付失败', error);
        error.errMsg.endsWith('cancel') && showToast('取消支付');
      }
    })
  }, 2000),
  hangleToGoodsDetail({
    currentTarget: {
      dataset: { spuid },
    },
  }) {
    networkAct(() => {
      wx.navigateTo({
        url: `${goodsDetail}?id=${spuid}`,
      });
    });
  },
  okHandle () {
// 跳转
    const closedStatusList = [3003, 3006]
    // 不管
    const goodChangedStatusList = [3002, 3009, 3001, 3011]
    const erors = [4444]
    const { orderState } = this.data
    this.setData({ orderState: null })
    if (erors.includes(orderState)) {
      return
    }
    if (closedStatusList.includes(orderState)) {
      console.log('进入该订单详情页，刷新订单实时状态')
      this.reload()
    }
    // if (goodChangedStatusList.includes(orderState)) {
    //   console.log('不管')
    // }
    // 单品信息变化的时候刷新当前页
    if ([3011].includes(orderState)) {
      this.reload()
    }
  },

  goComment () {
    showToast('请前往Fabrique App，就能发表评论啦')
  },
  toLogistics () {
    globalData.birthPlace = 'order-list';
    networkAct(() => {
      const { orderId: orderid } = this.data.orderInfo
      wx.navigateTo({
        url: `/pages/logistics/index?orderid=${orderid}`,
      });
    });
  },

  reckon () {
    const { orderStatus } = this.data
    console('padding-bottom:' + [1, 5, 6].includes(orderStatus) ? '200rpx' : '0rpx')
    return 'padding-bottom:' + [1, 5, 6].includes(orderStatus) ? '200rpx' : '0rpx'
  }
});
