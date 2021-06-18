const { surface, getUserInfo, networkAct, isLogin } = getApp();
import { mine, orderApi } from '../../api/index';
const qiyu_botton = require('../../behaviors/qiyu_botton')
Page({
  behaviors: [qiyu_botton],
  data: {
    userInfo: null,
    backSrc: null,
    waitPayOrderNum: 0,
    waitReceivingGoodsNum: 0,
    isLogged: false,
    avatar: null,
    name: null,
    isShow: false,
    opacity: 0
  },
  onLoad(options) {
    this.init();
  },
 async onShow() {
    console.log('this.data', this.data)
    const userInfo = getUserInfo()
    const isLogged = isLogin()
    this.setData({ userInfo, isLogged });
    this.getOrderNum();
    if (isLogged) {
      const { uid } = userInfo
      this.setData({ isShow: false })
      const info = await mine.get_user_info({ uid })
      if (info.code == 2000) {
        const { avatar, name } = info.data
        this.setData({ avatar, name })
      }
      this.setData({ isShow: true })
    }
  },
  init() {
    networkAct(async () => {
      const res = await mine.get_user_back()
      if (res.code == 2000) {
        const { backSrc } = res.data;
        this.setData({ backSrc });
      }
    })
  },
  async getOrderNum() {
    if (!this.data.isLogged) return
    const { uid } = this.data.userInfo
    const res = await orderApi.getPayOrderNum({ uid })
    if (res.code == 2000) {
      const { waitPayOrderNum, waitReceivingGoodsNum } = res.data;
      this.setData({ waitPayOrderNum, waitReceivingGoodsNum });
    }
  },
  goToOrder () {
    networkAct(async () => {
      if (this.data.isLogged) {
        const { waitPayOrderNum, waitReceivingGoodsNum } = this.data
        const index = waitPayOrderNum ? 1 : (waitReceivingGoodsNum ? 3 : 0)
        // surface(wx.navigateTo, { url: '/pages/order-list/index' + (this.data.waitPayOrderNum ? '?index=1': '') })
        surface(wx.navigateTo, { url: '/pages/order-list/index?index=' + index })
      } else {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc(data) {
              surface(wx.redirectTo, {
                url: '/pages/order-list/index'
              })
            }
          }
        })
      }
    })
  },
  goToAddressManage () {
    networkAct(() => {
      if (this.data.isLogged) {
        surface(wx.navigateTo, {
          url: '/pages/shipping-address/index'
        })
      } else {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc(data) {
              surface(wx.redirectTo, {
                url: '/pages/shipping-address/index'
              })
            }
          }
        })
      }
    })
  },
  tapToCopy(e) {
    const { id } = e.target.dataset
    surface(wx.setClipboardData, { data: id.toString() })
  },
  goToLogin(e) {
    networkAct(() => {
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          // 登录成功后的回调
          onLoginSucc(data) {
            console.log('回调');
            surface(wx.navigateBack);
          }
        },
      })
    })
  },
  goToChart () {
    networkAct(() => {
      surface(wx.navigateTo, {
        url: '/pages/login/index',
        events: {
          onLoginSucc() {
            wx.navigateBack()
          }
        }
      })
    })
  },
  goToMeasure() {
    networkAct(() => {
      if (this.data.isLogged) {
        surface(wx.navigateTo, { url: '/pages/measure/index?from=mine' })
      } else {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc() {
              surface(wx.redirectTo, { url: '/pages/measure/index?from=mine' })
            }
          }
        })
      }
    })
  },
  goToScore () {
    networkAct(() => {
      if (this.data.isLogged) {
        surface(wx.navigateTo, { url: '/pages/myscore/index' })
      } else {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc() {
              surface(wx.redirectTo, { url: '/pages/myscore/index' })
            }
          }
        })
      }
    })
  },
  load () {
    this.setData({ opacity: 1 })
  },
  preview () {
    this.selectComponent('#center-image').preview()
  }
});
