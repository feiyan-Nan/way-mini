import { orderApi } from '../../api/index';
const { showToast, surface, getUserInfo, networkAct, nextTick } = getApp();
const {
  routingConfig: { addShippingAddress, shippingAddress },
  debounce,
  throttle,
  formatThousands,
  uid,
} = getApp();
Page({
  data: {
    title: '',
    orderItems: [],
    address: {},
    totalPriceRmbStr: '',
    prePageData: null,
    loaded: false,
    delta: 1,
    total: '',
    orderInfo: null,
    orderStatus: null,
    warningText: '',
    tmplIds: null,
    remarkInputIsDisabled: true,
    remarkInputFocus: false,
    userRemark: ''
  },
  onLoad(options) {
    this.getTmplIds()
    const pages = getCurrentPages();
    const { route } = pages[pages.length - 2];
    let delta = this.data.delta;
    const specialRoutes = ['pages/login/index'];
    if (specialRoutes.includes(route)) {
      delta = 2;
    }
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptOrderSkuPage', (data) => {
      this.setData({ prePageData: data, delta }, () => {
        this.getOrderDetail(false, true);
      });
    })
  },
  // 这个方法会被添加地址页面调用
  async getOrderDetail(isToPay = false, fromSkuPage = false) {
    this.selectComponent('#loading').show()
    const { code, data, msg } = await orderApi.createOrder(this.data.prePageData);
    this.selectComponent('#loading').hide();
    if (code == 2000) {
      const { orderItems, totalPriceRmbStr, ...address } = data;
      const total = orderItems.reduce((curr, next) => {
        return curr + next.totalNum;
      }, 0);
      return new Promise((resolve) => {
        this.setData(
          {
            total,
            orderItems,
            address,
            totalPriceRmbStr: formatThousands(totalPriceRmbStr),
            loaded: true,
          },
          () => {
            resolve();
            isToPay && this.handleToPay();
          }
        );
      });
    } else if (fromSkuPage){
      surface(wx.navigateBack, {
        delta: 1,
      });
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.emit('createOrderError', msg);
    } else {
      showToast(msg);
    }
  },
  onPageScroll(e) {
    const title = e.scrollTop >= 30 ? '确认订单' : '';
    debounce(this.setData({ title }));
  },

  handleToPay: throttle(async function() {
    if (!this.data.address.consigneeName) {
      wx.navigateTo({
        url: `${addShippingAddress}&topay=true`,
      });
      return;
    }
    const res = await orderApi.orderPay({
      ...this.data.address,
      payMoney: this.data.address.totalPriceRmb,
      userRemark: this.data.userRemark
    });
    if (res.code != 2000) {
      // showToast(res.msg);
      const orderStatus = res.code
      const warningText = res.msg
      this.setData({ orderStatus, warningText })
      return;
    }

    if (res.code == 2000) {
      const params = {
        package: res.data.packageName,
        timeStamp: res.data.timestamp,
        ...res.data,
      };
      delete params.packageName;
      const { tmplIds } = this.data
      const _this = this
      wx.requestPayment({
        ...params,
        success(res) {
          const { uid } = getUserInfo()
          const { orderId } = _this.data.address
          const err_status_page = `/pages/errer-status/index?uid=${uid}&orderId=${orderId}`
          wx.requestSubscribeMessage({
            tmplIds,
            complete () {
              surface(wx.redirectTo, { url: err_status_page })
            }
          })
        },
        fail(error) {
          // 支付失败
          const { uid } = getUserInfo();
          const { orderId } = _this.data.address;
          wx.requestSubscribeMessage({
            tmplIds,
            fail (error) {
              console.log('requestSubscribeMessage error', error)
            },
            complete () {
              surface(wx.redirectTo, {url: `/pages/order-status/index?orderId=${orderId}`})
            }
          })
        }
      })
    }
  }, 2000),

  handleSelectAddress() {
    let that = this;
    wx.navigateTo({
      url: `/${shippingAddress}`,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromShippingAddressPage: function (address) {
          that.setData({ address: { ...that.data.address, ...address } });
        },
      },
    });
  },
  goAddAddress() {
    wx.navigateTo({
      url: addShippingAddress,
    });
  },
  okHandle () {
    // 跳转
    const closedStatusList = [3003, 3006]
    // 不管
    const goodChangedStatusList = [3002, 3009, 3001, 3011]
    const errors = [4444]
    const { orderStatus } = this.data
    this.setData({ orderStatus: null })
    if (errors.includes(orderStatus)) {
      return
    }
    if (closedStatusList.includes(orderStatus)) {
      const url = '/pages/order-status/index'
      surface(wx.navigateTo, { url }).then(res => {
        const { uid } = getUserInfo()
        const data = { ...this.data.address, uid }
        res.eventChannel.emit('acceptDataFromOrderListPage', data)
      })
    }
    // if (goodChangedStatusList.includes(orderStatus)) {
    //   console.log('不管')
    // }
  },
  async getTmplIds () {
    const res = await orderApi.find_subscribe_template()
    if (res.code === 2000) {
      const tmplIds = res.data.map(item => item.templateId)
      this.setData({ tmplIds })
    }
  },
  navigateBack() {
    const { delta } = this.data;
    wx.navigateBack({ delta });
  },

  tapRemark () {
    surface(wx.pageScrollTo, { selector: '.remark', duration: 0 }).then(() => {
      this.setData({
        remarkInputIsDisabled: false
      }, () => {
        nextTick(() => {
          this.setData({ remarkInputFocus: true })
        }, 100)
      })
    })
  },
  blur () {
    this.setData({ remarkInputIsDisabled: true, remarkInputFocus: false })
    // surface(wx.pageScrollTo, { scrollTop: 0, duration: 0 })
  },
  inputChange (e) {
    const { cursor, value } = e.detail
    if (cursor >= 100) {
      showToast('字数已经到达最大限制')
    }
    const userRemark = value.substr(0, 100)
    if (userRemark != this.data.userRemark) this.setData({ userRemark })
  }
});
