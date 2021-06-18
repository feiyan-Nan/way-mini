Component({
  properties: {
    background: {
      type: String,
      value: 'rgba(255, 255, 255, 1)',
    },
    // 是否沉浸式
    isImmersive: {
      type: Boolean,
      value: false,
    },
    color: {
      type: String,
      value: '#031c24',
    },
    title: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: true,
    },
    delta: {
      type: Number,
      value: 1,
    },
    logo: {
      type: Boolean,
      value: false
    },
    zIndex: {
      type: String,
      value: '1000'
    },
    backIconName: {
      type: String,
      value: 'back_arrow'
    },
    titleBarWidth: {
      type: String,
      value: '100%'
    },
    close: {
      type: Boolean,
      value: false
    }
    // showGoHome: {
    //   type: Boolean,
    //   value: false
    // }
  },
  data: {
    statusBarHeight: '',
    titleBarHeight: '',
    showGoHome: false,
    isHome: false
  },
  lifetimes: {
    attached() {
      const menuRect = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
      const pages = getCurrentPages()
      const [currPage] = pages.slice(-1)
      const isHome = currPage.is.includes('home/index')
      const showGoHome = ( pages.length == 1 ) && !isHome
      this.setData({
        isHome,
        showGoHome
      })
      // 定义导航栏的高度   方便对齐
      this.setData({
        statusBarHeight,
        titleBarHeight: menuRect.height + 2 * (menuRect.top - statusBarHeight),
        // 当页面栈为1的时候关闭返回按钮
        back: this.data.showGoHome ? true : getCurrentPages().length > 1
      });
    },
  },
  methods: {
    handleBack() {
      this.triggerEvent('back', { delta: this.properties.delta });
    },
    handleGoHome () {
      wx.switchTab({
        url: '/pages/home/index'
      })
    },
    goTop () {
      const { showToast } = getApp()
      console.log('pageScrollTo')
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 400
      })
      this.triggerEvent('goTop')
    },
    handleClose() {
      this.handleBack()
    }
  },
});
