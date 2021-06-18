// pages/goods-detail/components/m-bottom/index.js
const computedBehavior = require('miniprogram-computed')
const { showToast, getUserInfo, surface, globalData, checkConnected } = getApp();
const qiyu_botton = require('../../../../behaviors/qiyu_botton')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sizeArr: {
      type: Array,
      value: []
    },
    sizeIndex: {
      type: String,
      value: ''
    },
    showStat: {
      type: Boolean,
      value: 0
    },
    isLogged: {
      type: Boolean,
      value: false
    },
    sizeChatUrl: String,
    sizeTips: String,
    sizeInfo: {
      type: Object,
      value: null
    },
    display: {
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
      value: 'all'
    },
    simple: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showChooseSize: false, // 是否显示自定义picker
    singleChooseSize: false,
    chooseType: '', // 未选尺码，点击底部按钮 类型
    isX: false,
    _type: null,
    _display: null
  },
  observers: {
    type (_type) {
      this.setData({ _type })
    },
    display(_display) {
      this.setData({ _display })
    },
    // sizeInfo(sizeInfo) {
    //   console.log('sizeInfo…………………………', sizeInfo)
    // }
  },
  behaviors: [computedBehavior, qiyu_botton],
  computed: {
    _showStat(data) {
      if (data.showChooseSize) {
        if (!data.sizeArr[data.sizeIndex]) return true;
        const { showStat, stockNum } = data.sizeArr[data.sizeIndex];
        return showStat && stockNum > 0;
      } else {
        return data.showStat;
      }
    },
    buttonType(data) {
      const { _showStat, singleChooseSize, showChooseSize } = data;
      if (!_showStat || singleChooseSize) return 'singleButton';
      else return 'doubleButton';
    },
    extraStyle (data) {
      const { _showStat } = data;
      const style= 'background: #EDF0F0;color: #999999;font-family: SourceHanSansCN-Light, SourceHanSansCN;border: 0;'
      return _showStat ? '' : style
    }
  },
  lifetimes: {
    attached() {
      const isX = globalData.isX
      this.setData({ isX })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTapLeftBtn () {
      this.setData({ _type: 'addCar', _display: true })
      wx.nextTick(() => {
        this.selectComponent('.m-mask').show()
      })
    },
    handleTapRightBtn(e) {
      /** 已售罄的时候按钮不执行任何逻辑*/
      const { buttonType, _showStat } = this.data
      console.log(buttonType, _showStat)
      if (buttonType !== 'doubleButton' && !_showStat) return
      // console.log('立即购买')
      this.setData({ _type: 'buy', _display: true })
      wx.nextTick(() => {
        this.selectComponent('.m-mask').show()
      })
    },


    /** ------------尺码选择相关end-------------- */
    async toLogin() {
      await checkConnected();
      const userInfo = getUserInfo();
      if (!userInfo) {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc: (function() {
              surface(wx.navigateBack, {delta: 1});
            }).bind(this)
          }
        });
        return;
      }
    },
    handleBuy (e) {
      console.log('立即购买', e)
      this.triggerEvent('buy', { ...e.detail })
    },
    handleAddCar(e) {
      console.log('添加到购物车', e)
      this.triggerEvent('addCar', { ...e.detail })
    },
    handleChange(e) {
      console.log('handleChange', e)
    }
  }
})
