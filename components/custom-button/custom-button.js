// components/button-userinfo/button-userinfo.js
const { networkAct, surface } = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: '一键登录'
    },
    openType: {
      type: String,
      value: 'getUserInfo'
    }
  },
  data: {
    code: null,
    timer: null
  },

  attached() {
    this.makeNewCode()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap(e) {
      const _this = this
      networkAct(async () => {
        const { openType } = _this.properties
        if (openType == 'getPhoneNumber') {
          this.triggerEvent('tapHandle', e)
        }
        if (openType == 'getUserInfo') {
          const { code } = this.data
          _this.triggerEvent('tapHandle', Object.assign({}, e, { code }))
          // this.makeNewCode()
        }
      })
    },
    async makeNewCode () {
      if (this.properties.openType != 'getUserInfo') return
      // const sessionRes = await surface(wx.checkSession)
      // if (!sessionRes.errMsg.endsWith('ok')) return

      wx.checkSession({
        success(res) {
          console.log('res', res)
        },
        fail(err) {
          console.log('err', err)
        }
      })



      const loginRes = await surface(wx.login)
      const { code, errMsg } = loginRes
      if (!errMsg.endsWith('ok')) return
      console.log('code', code)
      this.setData({ code })
    }
  },

})
