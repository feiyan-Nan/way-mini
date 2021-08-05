const { networkAct, throttle, globalData, isLogin } = getApp();
// const qiyu_botton = require('../../behaviors/qiyu_botton')
Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  // behaviors: ['wx://form-field-button', qiyu_botton],
  properties: {
    // 右侧按钮
    buttonText: {
      type: String,
      value: '保存地址',
    },
    // 单按钮的样式(background: "#EDF0F0"; color: "#999999")已售罄样式
    extraStyle: {
      type: String,
      value: '',
    },
    // 售罄样式有after border属性，无法单纯通过style修改
    extraClass: {
      type: String,
      value: ''
    },
    // 左侧按钮
    leftButtonText: {
      type: String,
      value: '使用微信地址',
    },
    // singleButton, doubleButton,
    buttonTyep: {
      type: String,
      value: 'singleButton',
    },
    // 是否显示客户按钮
    isContact: {
      type: Boolean,
      value: false,
    },
    showMask: {
      type: Boolean,
      value: false
    },
    isLogged: {
      type: Boolean,
      value: false
    },
    noCheckNet: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isX: false,
    _isLogged: null,
    _isShow: false
  },
  lifetimes: {
    attached() {
      const isX = globalData.isX
      this.setData({ isX })
      setTimeout(() => {
        console.log('刚一进来的时候')
        const _isLogged = isLogin()
        this.setData({ _isLogged })
      })
    }
  },
  pageLifetimes: {
    show() {
      setTimeout(() => {
        console.log('触发页面展示的时候')
        const _isLogged = isLogin()
        this.setData({ _isLogged })
      })
    },
    hide () {
      setTimeout(() => {
        console.log('触发页面隐藏的时候')
        const _isLogged = isLogin()
        this.setData({ _isLogged })
      })
    }
  },
  methods: {
    // 添加了节流和网络的判断
    handleClick: throttle(function (e) {
      if (this.data.noCheckNet) this.triggerEvent('handleBottomButtonClick', e)
      else networkAct(() => this.triggerEvent('handleBottomButtonClick', e));
    }),
    handleLeftButtonClick: throttle(function (e) {
      if (this.data.noCheckNet) this.triggerEvent('handleLeftButtonClick', e)
      else networkAct(() => this.triggerEvent('handleLeftButtonClick', e));
    }),
    handleMaskClick() {
      this.triggerEvent('maskClick');
    },
    toLogin() {
      this.triggerEvent('toLogin');
    }
  },
});
