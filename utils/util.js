var amapFile = require('../sdk/amap-wx.js');
/**
 * 处理数据千分位  4545.56 ==>  ¥4,545.56
 * @param num
 * @returns {string|*}
 */
function formatThousands(num) {
  if (num || num === 0) {
    const temporaryValue =
      typeof num === 'number'
        ? num.toString().replace(/(^|\s)\d+/g, (m) => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
        : num;
    return `¥${temporaryValue}`;
  }
  return '--';
}

/**
 * 封装了微信的wx.showToast
 * @param params
 * @returns {Promise<unknown>}
 */

const showToast = (params = {}) =>
  surface(wx.showToast, {
    title: '似乎已经断开了与互联网的连接',
    icon: 'none',
    duration: 2000,
    mask: false,
    ...(params.constructor === Object ? params : { title: params }),
  });

/**
 * 封装了微信的wx.showModal
 * @param params
 * @returns {Promise<unknown>}
 */

const showModal = (params = {}) =>
  new Promise((resolve, reject) => {
    wx.showModal({
      title: '提示',
      success: ({ confirm }) => resolve(confirm),
      ...(params.constructor === Object ? params : { title: params }),
    });
  });

/**
 * 正则验证手机号
 * @param tel
 * @returns {boolean}
 */
const verifyTel = (tel) => /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/.test(tel);

/**
 * 订单倒计时计算
 * @param time
 * @returns {string|boolean}
 */
const formatCountDown = (time) => {
  let lefttime = Number(time) * 1000;
  let leftm = Math.floor((lefttime / (1000 * 60)) % 60); //计算分钟数
  let lefts = Math.floor((lefttime / 1000) % 60); //计算秒数
  if (lefttime > 0) {
    return `订单将在 ${leftm}分${lefts}秒 后自动关闭，请尽快完成支付`;
  } else {
    return false;
  }
};

/**
 * 时间戳转可视化时间
 * @param date
 * @param isSecond
 * @returns {string}
 */
const formatTime = (date, isSecond = false) => {
  var date = new Date(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (isSecond) {
    return (
      [year, month, day].map(formatNumber).join('-') +
      ' ' +
      [hour, minute, second].map(formatNumber).join(':')
    );
  } else {
    return (
      [year, month, day].map(formatNumber).join('-') +
      ' ' +
      [hour, minute].map(formatNumber).join(':')
    );
  }
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const chooseAddress = () => surface(wx.chooseAddress);

const getGaoDeRoute = () => {
  var myAmapFun = new amapFile.AMapWX({ key: '1bec4d50fba78fbb6153a12f88ab510e' });
  return new Promise((resolve, reject) => {
    myAmapFun.getPoiAround({
      querytypes: '150500|150700',
      offset: 10,
      success: function (data) {
        console.log(data);
        const { poisData } = data;
        const temp = poisData
          .map(({ address }) => {
            return address
              .split(';')
              .filter(
                (item) => !item.includes('在建') && !item.includes('规划') && !item.includes('停运')
              );
          })
          .flat(Infinity);
        const [lon, lat] = wx.getStorageSync('userLocation').split(',');
        const result = {
          lineNo: Array.from(new Set(temp)),
          cityName: poisData[0].cityname,
          lon,
          lat,
        };
        //成功回调
        resolve(result);
      },
      fail: function (info) {
        reject(info);
      },
    });
  });
};

// 获取定位的权限
function getLocationRight() {
  return new Promise((resolve) => {
    wx.getLocation({
      success: function (data) {
        //成功回调表示已经获取到微信定位的权限
        resolve();
      },
      fail: function (info) {
        console.log(info);
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userLocation'] === false) {
              showModal({
                title: '温馨提示',
                content: '您需要授权后，才能找到和你顺路的人，是否重新授权',
              }).then((res) => {
                res &&
                  wx.openSetting({
                    success(res) {
                      console.log('设置success：', res.authSetting);
                      if (res.authSetting['scope.userLocation'] === true) {
                        // 打开设置后, 获取权限了
                        resolve();
                      }
                    },
                    fail(err) {
                      console.log('设置fail:', err);
                    },
                  });
              });
            }
          },
        });
      },
    });
  });
}
function getWechatAddress() {
  return new Promise((resolve) => {
    wx.getSetting({
      success(res) {
        // 1 如果 res.authSetting 对象为空，说明小程序还没有向用户请求过权限
        if (res.authSetting['scope.address'] === undefined) {
          resolve(chooseAddress());
          // 此时，应该向用户请求 通讯地址 权限
        } else if (res.authSetting['scope.address'] === true) {
          // 说明用户已经授权过了，此时，只需要再次打开收获地址界面，让用户选择收获地址即可
          resolve(chooseAddress());
        } else if (res.authSetting['scope.address'] === false) {
          // 说明小程序已经向用户请求过授权了，但是，用户拒绝了
          // 当用户第二次点击按钮的时候，就会执行这个逻辑
          showModal({
            title: '温馨提示',
            content: '您需要授权后，才能使用收获地址功能，是否重新授权',
            confirmColor: '#ff2d4a',
          }).then((res) => {
            // 如果用户点了确定，就打开 设置 界面
            res &&
              wx.openSetting({
                success(res) {
                  // 不管是否开启授权，都执行success
                  // 应该根据 res['scope.address'] 是 true 或 false 来确定用户是否同意授权
                  console.log('设置success：', res.authSetting);
                  if (res.authSetting['scope.address'] === true) {
                    // 直接打开收获地址选择界面，让用户选择收获地址
                    resolve(chooseAddress());
                  }
                },
                fail(err) {
                  console.log('设置fail:', err);
                },
              });
          });
        }
      },
      fail(err) {
        console.log('err--------', err);
      },
    });
  });
}

// 自定义nextTick 原生有时候会提前执行
const nextTick = (fn) => fn && setTimeout(fn, 17);

// 复制功能
const copy = (data = '') => surface(wx.setClipboardData, { data });

// 简化微信原生方法调用
const surface = (fn, options = {}) =>
  new Promise((resolve, reject) =>
    fn({
      ...options,
      success: resolve,
      fail: reject,
    })
  );

const indexMapOrderStatus = (num) => {
  const status = {
    0: -1,
    1: 1,
    2: 2,
    3: 5,
    4: 6,
  };
  return status[num];
};

const orderStatusMapFun = (num) => {
  // 1:待支付，2:待发货，3:已取消，4:异常，5:待收货，6:交易成功
  const status = {
    0: '未确认',
    1: '待支付',
    2: '待发货',
    3: '已取消',
    4: '异常',
    5: '待收货',
    6: '交易成功',
  };
  return status[num];
};

// 获取本地缓存的用户信息, 如果没有登陆返回‘’
const getUserInfo = (key = 'userInfo') => wx.getStorageSync(key);

/**
 * 获取用户的uid
 */
const uid = () => getUserInfo() && getUserInfo().uid;

/**
 * 判断是否登陆
 */
const isLogin = () => Boolean(getUserInfo());
/**
 * TODO 路由信息
 * @type {{confirmOrder: string, editShippingAddress: string, addShippingAddress: string}}
 */
const routingConfig = {
  home: '/pages/home/index',
  addShippingAddress: '/pages/add-shipping-address/index?status=add',
  editShippingAddress: '/pages/add-shipping-address/index?status=edit',
  confirmOrder: 'pages/confirm-order/index',
  shippingAddress: 'pages/shipping-address/index',
  goodsDetail: '/pages/goods-detail/index',
  webview: '/pages/webview/index',
  orderStatus: '/pages/order-status/index',
};

const getDetetailAddress = (data) => {
  let result = data.provinceName;
  if (data.cityName) {
    result += data.cityName.trim();
  }
  if (data.countyName) {
    result += data.countyName;
  }
  return result;
};

/**
 * 获取页面栈中的某个页面信息
 * @param url 页面路由
 * @returns {WechatMiniprogram.Page.Instance<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject>}
 */
const getPageInformation = (url = '') => {
  return getCurrentPages().find(({ route }) => route === url);
};

const checkConnected = async (hideToast) => {
  if (!getApp().globalData.isConnected) {
    if (!hideToast) showToast('似乎已经断开了与互联网的连接');
    throw new Error();
  }
};
// 获取机型
const checkIsX = () => {
  const res = wx.getSystemInfoSync();
  const { model } = res;
  console.log('model', model);
  const xArr = ['X', 'iPhone 11', 'iPhone13'];
  const isX = xArr.some((item) => model.includes(item)) ? model : null;
  console.log('isX-------', isX);
  return isX;
};

// 判断是否断网
const networkAct = (fn) => {
  getApp().globalData.isConnected ? fn && fn() : showToast();
};
module.exports = {
  formatThousands,
  getWechatAddress,
  getLocationRight,
  getGaoDeRoute,
  showToast,
  verifyTel,
  showModal,
  formatCountDown,
  formatTime,
  nextTick,
  surface,
  indexMapOrderStatus,
  copy,
  getUserInfo,
  routingConfig,
  getPageInformation,
  uid,
  isLogin,
  getDetetailAddress,
  orderStatusMapFun,
  checkConnected,
  checkIsX,
  networkAct,
};
