Page({
  data: {
    close: true,
    precise: [],
    spuId: null,
    basicTip: null
  },
  onLoad() {
    console.log(this.options)
    const { from } = this.options
    if (from == 'mine') {
      const precise = ['chest', 'waist', 'hip']
      this.setData({ precise, basicTip: false })
    }

    if (from == 'detail') {
      const majorSize = JSON.parse(this.options.majorSize)
      const { chest, waist, hip, spuId } = majorSize
      const precise = Object.keys({ chest, waist, hip }).filter(key => majorSize[key])
      this.setData({ precise, spuId, basicTip: Boolean(precise.length) })
    }

  },
  handleBack () {
    wx.navigateBack()
  },
  handleUpDate (e) {
    console.log('handleUpDate 变了一下', e)
    console.log('getCurrentPages', getCurrentPages())
    const pages = getCurrentPages()
    const detail = pages.find(item => item.route.includes('goods-detail'))
    if (detail) detail.getData()
  }
});