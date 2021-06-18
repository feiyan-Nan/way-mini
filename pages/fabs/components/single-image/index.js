Component({
  properties: {
    info: Object
  },
  data: {
    params: null,
    opacity: 0
  },
  observers: {
    info (val) {
      const { screenWidth } = wx.getSystemInfoSync()
      console.log('screenWidth', screenWidth)
      console.log('single-image', val)
      const { localStyle, width, height } = val
      let params
      if (localStyle == 'zishiying') {
        const h = height * screenWidth / width + 'px'
        params = {
          style: `width: 100vw;height: ${h};`,
          mode: 'widthFix',
          height: h
        }
      }

      if (localStyle == 'hengtu') {
        params = {
          style: 'height: 100vw;transform: translateX(-50%);left: 50%;',
          mode: 'heightFix',
          height: '100vw;'
        }
      }


      if (localStyle == 'fangtu') {
        params = {
          style: 'width: 100vw;height: 100vw;',
          mode: 'widthFix',
          height: '100vw;'
        }
      }

      if (localStyle == 'bili') {
        params = {
          style: 'width: 100vw;height: 150vw;',
          mode: 'widthFix',
          height: '150vw;'
        }
      }

      if (localStyle == 'changtu') {
        params = {
          style: 'width: 100vw;transform: translateY(-50%);top: 50%;',
          mode: 'widthFix',
          height: '150vw;'
        }
      }
      this.setData({ params })
    }
  },
  methods: {
    load () {
      this.setData({ opacity: 1 })
    }
  }
});
