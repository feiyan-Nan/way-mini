import { orderApi } from '../../api/index';
const { globalData, showToast } = getApp();

const {
  orderStatusMapFun,
  formatThousands,
  debounce,
  formatTime,
  uid,
  networkAct,
  routingConfig: { orderStatus },
} = getApp();
const titles = ['全部', '待支付', '待发货', '待收货'];

Page({
  data: {
    tabs: [],
    activeTab: 0,
    orderData: [],
    triggered: false,
    pageNum: 1,
    isload: true,
    scrollY: true,
    uid: '',
    title: '',
    isRefresh: true,
    orderNums: [],
    scrollTop: 0,
    dialog: {
      title: '确认要收货吗？',
      content: '收货后你将获得500积分'
    },
    isShowDialog: false
  },
  onLoad: function (options) {
    const tabs = titles.map((item) => ({ title: item }));
    let { index } = options;
    if (index === undefined) {
      index = 0;
    }
    const activeTab = Number(index);
    this.setData({ tabs, activeTab });
    // activeTab === 0 ? this.getOrderData(titles[activeTab]) : this.setData({ activeTab });

    this.setData(
      {
        pageNum: 1,
        orderData: [],
      },
      () => {
        this.getOrderNum();
        this.getOrderData(titles[this.data.activeTab]);
      }
    );
  },
  getOrderNum() {
    orderApi.getPayOrderNum({ uid: uid() }).then((res) => {
      const { waitPayOrderNum, waitSendOutGoodsNum, waitReceivingGoodsNum } = res.data;
      this.setData({
        orderNums: ['', waitPayOrderNum, waitSendOutGoodsNum, waitReceivingGoodsNum],
      });
    });
  },
  onPageScroll(e) {
    console.log(e.scrollTop);
    const title = e.scrollTop >= 30 ? '我的订单' : '';
    debounce(this.setData({ title }));
    if (e.scrollTop > 50) {
      this.setData({
        scrollY: true,
        isRefresh: false,
      });
    } else {
      this.setData({
        scrollY: false,
        isRefresh: true,
      });
    }
  },
  onRefresh() {
    networkAct(() => {
      if (this._freshing) return;
      this._freshing = true;
      this.setData(
        {
          pageNum: 1,
          orderData: [],
        },
        () => {
          this.getOrderNum();
          this.getOrderData(titles[this.data.activeTab]).then((res) => {
            this.setData({
              triggered: false,
            });
            this._freshing = false;
          });
        }
      );
    });
    !globalData.isConnected &&
      this.setData({
        triggered: false,
      });
  },
  async getOrderData(data) {
    let result = null;
    const params = {
      uid: uid(),
      pageNum: this.data.pageNum,
    };
    switch (data) {
      case titles[0]: {
        result = await orderApi.getAllOrderList(params);
        break;
      }
      case titles[1]: {
        result = await orderApi.getWaitForPayList(params);
        break;
      }
      case titles[2]: {
        result = await orderApi.getWaitSendOutGoodsList(params);
        break;
      }
      case titles[3]: {
        result = await orderApi.getWaitReceivingList(params);
        break;
      }
    }
    if (result.data.length === 0) {
      this.setData({
        isload: false,
      });
      return false;
    }
    const tempData = result.data.map(
      ({ orderTime, orderStatus, orderItems, totalRmbPriceStr, ...item }) => ({
        ...item,
        totalRmbPriceStr: formatThousands(totalRmbPriceStr),
        formatOrderTime: formatTime(+orderTime),
        orderStatusMap: orderStatusMapFun(orderStatus),
        orderItems: orderItems,
        orderStatus: orderStatus,
      })
    );
    return new Promise((resolve) => {
      this.setData(
        {
          orderData: this.data.orderData.concat(tempData),
        },
        resolve
      );
    });
  },
  onChange(e) {
    networkAct(() => {
      console.log('改变', e.detail);
      const index = e.detail.index;
      this.setData(
        {
          activeTab: index,
          pageNum: 1,
          orderData: [],
          isload: true,
        },
        () => {
          this.getOrderData(titles[index]);
          this.getOrderNum();
        }
      );
    });
  },
  scrollToLower() {
    networkAct(() => {
      this.setData(
        {
          pageNum: ++this.data.pageNum,
        },
        () => {
          if (this.data.isload) {
            this.getOrderData(titles[this.data.activeTab]);
          }
        }
      );
    });
  },
  toOrderDetails(e) {
    globalData.birthPlace = 'order-list';
    networkAct(() => {
      const dataset = e.currentTarget.dataset;
      wx.navigateTo({
        url: orderStatus,
        success(res) {
          res.eventChannel.emit('acceptDataFromOrderListPage', dataset);
        },
      });
    });
  },
  toLogistics (e) {
    globalData.birthPlace = 'order-list';
    networkAct(() => {
      const dataset = e.currentTarget.dataset;
      const { orderid } = dataset
      wx.navigateTo({
        url: `/pages/logistics/index?orderid=${orderid}`,
      });
    });
  },
  goComment () {
    showToast('请前往Fabrique App，就能发表评论啦')
  },
  navigateBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
  goTop () {
    this.setData({
      scrollTop: 0
    })
  },
  confirmReceipt () {
      console.log('确认收货，去打开弹窗')
    this.setData({
      'dialog.isShowDialog': true
    })
  },

  dialogHandle () {
    console.log('dialogHandle')
  }
});
