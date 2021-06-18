const { surface } = getApp();

Component({
  properties: {
    src: String,
    radius: {
      type: String,
      value: '50%'
    }
  },
  data: {
    mode: null,
    style: null,
    opacity: 0
  },
  observers : {
    src () {
      this.makeMode()
    }
  },
  methods: {
    async makeMode () {
      const src = this.properties.src
      const _this = this

      wx.getImageInfo({
        src,
        success(res) {
          const { width, height } = res
          const mode = width <= height ? 'widthFix' : 'heightFix'
          const translateY = 'width: 100%;top: 50%;transform: translateY(-50%);left: 0;'
          const translateX = 'height: 100%;left: 50%;transform: translateX(-50%);top: 0;'
          const style = height === width ? "width: 100%" : ((width < height) ? translateY : translateX)
          _this.setData({ mode, style })
          _this.triggerEvent('load')
        }
      })


      // const { width, height } = await surface(wx.getImageInfo, { src })
      // const mode = width <= height ? 'widthFix' : 'heightFix'
      // const translateY = 'width: 100%;top: 50%;transform: translateY(-50%);left: 0;'
      // const translateX = 'height: 100%;left: 50%;transform: translateX(-50%);top: 0;'
      // const style = height === width ? "width: 100%" : ((width < height) ? translateY : translateX)
      // this.setData({ mode, style })
      // this.triggerEvent('load')
    },
    preview () {
      wx.previewImage({
        urls: [this.properties.src]
      })
    },
    load () {
      this.setData({ opacity: 1 })
    }
  }
});
