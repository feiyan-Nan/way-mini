const { surface, globalData, showToast } = getApp()
import { login } from '../../api/index'
Page({
  data: {
    _code: null,
    _fresh: false
  },
  async login (e) {
    const { type, detail, code } = e.detail
    // console.log('detail', detail)
    if ( type != 'getuserinfo' || !detail.errMsg.endsWith('ok')) return
    delete detail.errMsg
    const params = { code, ...detail }
    const loading = this.selectComponent('#loading')
    this.setData({ _code: code }, () => loading.show())
    const res = await login.wechat_login(params)
    loading.hide()
    if (res.code == 2000) {
      const { data } = res
      globalData.userInfo = data
      wx.setStorageSync('userInfo', data)
      console.log('本地缓存写入成功', data)
      const _fresh = data.fresh
      if (_fresh){
        this.setData({ _fresh })
        return
      }
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('onLoginSucc', { data })
    }
    if (res.code == 2004) {
      this.selectComponent('.modal').show()
    }
    if (res.code == 5001) {
      console.log('登录失败', res)
    }
  },

  async getPhoneNumHandle (e) {
    console.log('getPhoneNumHandle', e)
    const { errMsg, encryptedData, iv } = e.detail.detail.detail
    if (!errMsg.endsWith('ok')) return
    const res = await login.wechat_register({
      code: this.data._code,
      encryptedData,
      iv
    })
    if (res.code != 2000) {
      showToast(res.msg)
      return
    }
    if (res.code == 2000) {
      const { data } = res
      globalData.userInfo = data
      console.log('输入手机号码后本地缓存写入成功')
      wx.setStorageSync('userInfo', data)
      // 增加判断逻辑
      const _fresh = data.fresh
      if (_fresh){
        this.setData({ _fresh })
        return
      }
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.emit('onLoginSucc', { data })
    }
  },

  goBack () {
    surface(wx.navigateBack)
  },
  startFab(e) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('onLoginSucc', { data: wx.getStorageInfoSync('userInfo') })
  }
})