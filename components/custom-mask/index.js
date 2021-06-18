const { globalData, debounce } = getApp()

Component({
  data: {
    animationData: {},
    style: '',
    shows: {
      all: false,
    },
    isshow: ''
  },
  lifetimes: {
    attached() {
      this.setData({ style: globalData.isX ? 'padding-bottom: 60rpx': '' })
    }
  },
  methods: {
    hide () {
      if (this.running) return
      this.running = true
      this.status = 'hide'
      this.setData({ isshow: '' })
    },
    show () {
      if (this.running) return
      this.running = true
      this.status = 'show'
      this.setData({ 'shows.all': true })
      setTimeout(() => this.setData({ isshow: 'custom_mask_body_show' }))
    },
    transitionend: debounce(function() {
      // console.log(999)
      this.running = false
      if (this.status === 'hide') {
        this.setData({ 'shows.all': false })
        this.triggerEvent('hide')
      }
    }, 20)
  }
});
