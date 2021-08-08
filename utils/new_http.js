import './polyfill';
import config from '../config.js';
const { surface } = getApp();

// 刷新token的私有方法
const _refreshToken = () => {
  // const { globalData } = getApp()
  // const userInfo = wx.getStorageSync('userInfo')
  const { globalData, getUserInfo } = getApp();
  const userInfo = getUserInfo();
  console.log('用当前的ft去刷新一下', userInfo);
  const { ft } = userInfo;
  const options = {
    url: config.baseUrl + '/mini/token/ft_refresh_at',
    data: { ft },
    method: 'POST',
  };
  const connect = () =>
    surface(wx.request, options).then((res) => {
      // console.log('++++++++++++++++++++', res.data)
      const { code } = res.data;

      if (code == 2000) {
        const { at, ft } = res.data.data;
        Object.assign(userInfo, { at, ft });
        globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        return Promise.resolve();
      }

      if (code == 2018) {
        wx.clearStorageSync();
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc(data) {
              surface(wx.navigateBack);
            },
          },
        });
        return Promise.reject();
      }
      if (code == 2125) {
        wx.clearStorageSync();
        wx.switchTab({ url: '/pages/hone/index' });
        return Promise.reject();
      }
      return Promise.resolve();
    });

  return connect();
};

class HTTP {
  request({ url, data = {}, method = 'POST', header = {} } = {}) {
    const connect = () => {
      const { getUserInfo } = getApp();
      const userInfo = getUserInfo()
      const options = {
        timeout: 10000,
        url: config.baseUrl + url,
        data,
        method,
        header: {
          'content-type': 'application/json',
          token: userInfo ? userInfo.accessToken : '',
          deviceId: '18d6cce10f64daac',
          appid: '10003',
          ft: userInfo ? userInfo.ft : '',
          uid: userInfo ? userInfo.uid : '',
          ...header,
        },
      };
      return surface(wx.request, options)
        .then(res => {
          const { m } = res.data
          if (m == '请先登录') {
            // wx.clearStorageSync();
            surface(wx.navigateTo, { url: '/pages/start-page/index' });
            return Promise.reject(res.data)
          }
          return Promise.resolve(res.data)
        })
        .catch(Promise.reject)
    };
    return connect();
  }
}

export { HTTP };
