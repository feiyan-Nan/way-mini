const { uid, networkAct } = getApp()

Component({
  properties: {
    _fabs: Array,
    spuId: String
  },
  data: {
    box_width: null,
    _data: null
  },
  observers: {
    _fabs (val) {
      // const _data = val.map(item => Object.assign(item, {imageSrc: JSON.parse(item.imageSrc)}))
      const _data = val.map(item => Object.assign(item, { imageSrc: JSON.parse(item.imageSrc) }))
        .map(item => {
          const imageSrc = item.imageSrc.filter((it, index) => index == 0).map(it => {
            const { width, height } = it
            // const type = width > height ? 'hengtu': width == height ? 'fangtu' : 'long'
            const type = width >= height ? 'hengtu' : height / width >= 1.5 ? 'long': 'hengtu'

            // const mode = width >= height ? 'heightFix': 'widthFix'
            const mode = width >= height ? 'heightFix': height / width >= 1.5 ? 'widthFix' : 'heightFix'
            const style = ['hengtu', 'fangtu'].includes(type) ? 'height: 100%;left: 50%;transform: translateX(-50%);' : 'width: 100%;'
            const params = { type, mode, style }
            return Object.assign(it, params)
          })
          return Object.assign(item, { imageSrc })
        })

      console.log('_data___________', _data)
      const box_width = val.length ? (val.length + 1) * 350 : null
      this.setData({
        box_width,
        _data
      })
    }
  },
  methods: {
    toFabs (e) {
      networkAct(() => {
        const { spuId } = this.properties
        const { index } = e.mark
        wx.navigateTo({
          url: '/pages/fabs/index?index=' + index + '&spuId=' + spuId
        })
      })
    }
  }
});
