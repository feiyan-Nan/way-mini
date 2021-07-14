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
  request({ url, data = {}, method = 'POST' } = {}) {
    const connect = () => {
      const { globalData, getUserInfo } = getApp();
      const userInfo = getUserInfo();

      // const userInfo = globalData.userInfo
      const options = {
        timeout: 10000,
        url: config.baseUrl + url,
        data,
        method,
        header: {
          'content-type': 'application/json',
          Authorization: userInfo ? userInfo.accessToken : '',
          ft: userInfo ? userInfo.ft : '',
          uid: userInfo ? userInfo.uid : '',
        },
      };
      return surface(wx.request, options)
        .then(async (res) => {
          const { code } = res.data;
          // console.log('code*******', res)
          // 重新刷新 token
          switch (code) {
            case 2126:
              try {
                console.log('遇到2126去刷新---------');
                await _refreshToken();
                return connect();
              } catch (e) {
                console.log('******* _refreshToken 2126 err', e);
              }
            case 2125:
              wx.clearStorageSync();
              surface(wx.switchTab, { url: '/pages/home/index' });
              return Promise.reject(res);
            default:
              return Promise.resolve(res.data);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    };
    return connect();
  }
}

export { HTTP };
