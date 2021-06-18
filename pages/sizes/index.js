const { globalData } = getApp()

Page({
  data: {
    style: '',
    info: null
  },
  onReady () {
    this.setData({ style: globalData.isX ? 'padding-bottom: 60px;' : '' })
  },
  onLoad () {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('sizeInfo', ({sizeInfo}) => {
      console.log(sizeInfo)
      // const { sizeTileImg, sizeTileVoList, sizeTips, hasRecommendedSize, recommendedSizeIndex } = sizeInfo
      this.setData({
        info: sizeInfo
      })
    })
  },
  handleBack: wx.navigateBack
});