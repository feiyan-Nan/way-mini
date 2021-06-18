// const computedBehavior = require('miniprogram-computed')
const { getUserInfo, surface, checkConnected, debounce } = getApp()
Component({
  properties: {
    display: {
      type: Boolean,
      value: false
    },
    sizeInfo: {
      type: Object,
      value: null
    },
    manyBtnMode: {
      type: Boolean,
      value: false
    },
    type: {
      type: String,
      /*
      * 加入购物袋 addCar
      * 立即购买 buy
      * 全部 all
      * */
      value: 'addCar'
    },
    tip: {
      type: Boolean,
      value: true
    },
    isShopBag: {
      type: Boolean,
      value: false
    },
    isLogged: {
      type: Boolean,
      value: false
    },
  },
  data: {
    arr: [...new Array(10).keys()],
    value: [0],
    _realIndex: 0,
    size: null,
    _desc: '',
    _curr: null,
    _test: '量一量',
    _tip: '',
    _simple: null,
    _route: null,
    _isLogged: null
  },
  lifetimes: {
    ready() {
      const [ currPage ] = getCurrentPages().slice(-1)
      this._route = currPage.route

      this.setData({
        _route: currPage.route,
      })
    }
  },
  pageLifetimes: {
    show() {
      this.setData({
        _isLogged: Boolean(getUserInfo())
      })
    }
  },
  // behaviors: [computedBehavior],
  observers: {
    sizeInfo (val) {
      console.log('val^^^^^^^^^^^', val)
      if (val) {
        setTimeout(() => {
          const { skuInfoVoList, recommendedSkuIndex, recommendedSize, hasRecommendedSize, isSizeSpu } = val
          const detailPage = getCurrentPages().find(page => page.route.includes('goods-detail'))
          const shoppingBag = this.data._route.includes('shopping-bag')
          const isLogin = getUserInfo()

          /** 量一量*/
          if ((shoppingBag || detailPage ) && isLogin && isSizeSpu) {
            if (this.data._route.includes('goods-detail')) {
              console.log('进入量一量逻辑')
              let _test = '量一量'
              const { userSizeVo, majorSize } = val
              const { height, weight, chest, waist, hip } = userSizeVo
              const sizes = [height, weight, chest, waist, hip]
              console.log('sizes-------', sizes)
              if (sizes.filter(item => item).length) {
                if (!(height && weight)) {
                  _test = '再量一量'
                } else {
                  if(sizes.filter(item => Number(item)).length != 0) {
                    // const major = ['chest', 'waist', 'hip']
                    if (majorSize.chest == 1 && !chest) {
                      _test = '再量一量'
                    }

                    if (majorSize.waist == 1 && !waist) {
                      _test = '再量一量'
                    }

                    if (majorSize.hip == 1 && !hip) {
                      _test = '再量一量'
                    }
                  }
                }
              }
              console.log('_test', _test)
              this.setData({ _test })
            }
          }

          const centerIndex = skuInfoVoList.length <= 2 ? skuInfoVoList.length - 1 : (Math.floor( skuInfoVoList.length / 2 ) )
          console.log('centerIndex---', centerIndex)
          // const centerIndex = Math.ceil((skuInfoVoList.length - 1) / 2)
          const _value = hasRecommendedSize ?  ( recommendedSkuIndex >= 0 ? recommendedSkuIndex : centerIndex ) : centerIndex
          // const _value = 0
          console.log('value---&&&^^^', _value)
          const _curr = skuInfoVoList[ _value ]
          this._curr = _curr
          const size = hasRecommendedSize ? `${recommendedSize}码`: '——'
          this.setData({ _curr, size, value: [_value], _simple: Boolean(isSizeSpu) })
        }, 200)
      } else {
        this.setData({ size: '——' })
      }
    },
    display (val) {
      if (this.properties.sizeInfo) {
        val ? this.show() : this.hide()
      }
      val && wx.nextTick(() => {
        this.setData({ _display: val })
      })
    }
  },
  methods: {
    pickerChange: debounce(function(e) {
      const { skuInfoVoList } = this.properties.sizeInfo
      const [ _realIndex ] = e.detail.value
      const _curr = skuInfoVoList[_realIndex]
      const value = [_realIndex]
      this._curr = _curr
      this.setData({ _realIndex, _curr, value })
      this.triggerEvent('change', { type: 'change', curr: _curr, num: _realIndex })
    }, 50),
    async toSizes () {
      await checkConnected()
      const { sizeInfo } = this.properties
      wx.navigateTo({
        url: '/pages/sizes/index',
        success(res) {
          res.eventChannel.emit('sizeInfo', { sizeInfo })
        }
      })
    },
    handleOk() {
      const { type } = this.properties
      wx.nextTick(() => {
        type === 'addCar' ? this.handleTapLeftBtn() : this.handleTapRightBtn()
      })
    },
    handleTapLeftBtn() {
      // console.log('左边的加入购物袋')
      this.triggerEvent('addCar', {type: 'addCar', curr: this._curr})
    },
    handleTapRightBtn () {
      // console.log('右边的立即购买')
      this.triggerEvent('buy', {type: 'buy', curr: this._curr})
    },

    show () {
      this.selectComponent('.custom_mask').show()
    },
    hide () {
      this.selectComponent('.custom_mask').hide()
    },
    async toMeasure () {
      await checkConnected()
      const { sizeInfo } = this.properties
      const url = '/pages/measure/index?from=detail&majorSize='
      if (getUserInfo()) {
        wx.navigateTo({
          url: url + JSON.stringify(sizeInfo.majorSize)
        })
      } else {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc() {
              const pages = getCurrentPages()
              const detail = pages.find(item => item.route.includes('goods-detail'))
              if (detail) detail.getData()
              wx.nextTick(() => {
                surface(wx.redirectTo, { url: url + JSON.stringify(sizeInfo.majorSize) } )
              })
            }
          }
        })
      }
    },
    // 弹窗关闭的回调
    handleMaskHide() {
      // this.triggerEvent('hide')
      this.setData({ _display: false })
    },
    toLogin() {
      this.triggerEvent('toLogin')
    }
  }
});
