Page({
  data: {
    title: '我的积分',
    h: null,
    total: 0,
    _title: null,
    sticky: [
      {
        text: '全部',
      },
      {
        text: '收入',
      },
      {
        text: '支出',
      }
    ],
    activeIndex: 0,
    test_list1: [],
    test_list2: [],
  },
  onReady () {
    this.setData({
      test_list1: [...new Array(3).keys()].map(item => ({ uuid: Math.random().toString(36).slice(-6) })),
      test_list2: [...new Array(20).keys()].map(item => ({ uuid: Math.random().toString(36).slice(-6) }))
    })
    this._makeH()
    setTimeout(this._oberverTitle)
  },
  _makeH () {
    // const menuButton = wx.getMenuButtonBoundingClientRect()
    // console.log('menuButton------', menuButton)
    const { screenHeight } = wx.getSystemInfoSync()
    this.createSelectorQuery().select('.navbar').boundingClientRect(rect => {
      const { height: navH } = rect
      const scrollH = screenHeight - navH
      // const scrollH = screenHeight - menuButton.bottom
      const h = {navH, scrollH, screenHeight}
      console.log('h', h)
      this.setData({ h })
    }).exec()

    this.createSelectorQuery().select('.mp-sticky').boundingClientRect(rect => {
      const { height: stickyH } = rect
      this.setData({ 'h.stickyH': stickyH })
    }).exec()

    this.createSelectorQuery().select('.sticky').boundingClientRect(rect => {
      console.log('sticky---', rect.bottom)
      this.setData({ 'h.emptyH': `calc(100vh - ${rect.bottom}px)` })
    }).exec()
  },

  _oberverTitle () {
    this.createIntersectionObserver({
      thresholds: [0, 1]
    })
      .relativeTo('#scroll-view')
      .observe('.title', res => {
        const _title = res.intersectionRatio > 0.9 ? '' : this.data.title
        if (_title !== this.data._title) this.setData({ _title })
      })
  },
  tapHandle (e) {
    const { index: activeIndex } = e.mark
    this.setData({ activeIndex })
  },
  stickyScrollHandle (e) {
    console.log(e.detail)
  },
  back () {
    wx.navigateBack()
  }
});