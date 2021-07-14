//app.js
import '/utils/polyfill';
import utils from '/utils/util';
import lodash from '/utils/lodash';
App({
  onLaunch: function () {
    const that = this;
    // 检测新版本
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      that
        .showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
        })
        .then(() => {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate();
        });
    });
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType;
        if (networkType === 'none') {
          that.globalData.isConnected = false;
          that.showToast({ title: '当前无网络', icon: 'loading' });
        }
      },
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    // wx.onNetworkStatusChange((res) => (that.globalData.isConnected = Boolean(res.isConnected)));
    wx.onNetworkStatusChange((res) => {
      console.log('onNetworkStatusChange', res);
      that.globalData.isConnected = Boolean(res.isConnected);
    });

    // 判断是否是刘海机
    const isX = utils.checkIsX();
    that.globalData.isX = isX;
  },
  // 页面找不到的时候
  onPageNotFound(res) {
    wx.redirectTo({
      url: '/pages/homepage/index',
    }); // 如果是 tabbar 页面，请使用 wx.redirectTo
  },

  globalData: {
    isConnected: true, //网络状态,
    isX: false,
    birthPlace: null,
  },
  ...utils,
  ...lodash,
});
