// pages/home/components/m-swiper/index.js
const { surface } = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    swiperItem: Array,
    cover: String,
    current: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    testSrc: 'https://www.w3cschool.cn/statics/demosource/mov_bbb.mp4',
    _height: 0,
    fullScreen: false
  },
  lifetimes: {
    attached() {
      const { windowWidth } = wx.getSystemInfoSync();
      this.setData({
        _height: windowWidth / 2 * 3
      });
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    async currentChange({ detail: { current, source } }) {
      this.setData({
        current,
        [`swiperItem[${current}].height`]: this.data.swiperItem[current].height,
        [`swiperItem[${current}].defaultY`]: this.data.swiperItem[current].defaultY,
        [`swiperItem[${current}].scale`]: 1,
      });
      if (current !== 0 && this.data.swiperItem[0].isPlay) {
        this.pauseAllVideo();
      }
      // if (this.data.swiperItem[current].type !== 'video') return;
      // const { networkType } = await surface(wx.getNetworkType);
      // if (networkType === 'wifi') {
      //   this.playVideo(current);
      // }
    },
    trogglePlay({ detail: { troggle }, currentTarget: { id, dataset: { index } } }) {
      this.setData({
        [`swiperItem[${index}].isPlay`]: typeof troggle !== 'boolean' ? !this.data.swiperItem[index].isPlay : troggle
      });
    },
    seekVideo(index, time) {
      this.selectComponent(`#swiper${index}`).videoContext.seek(time);
    },
    playVideo(index) {
      setTimeout((() => {
        // TODO 这里需要先关闭页面所有视频
        this.selectComponent(`#swiper${index}`).play();
      }).bind(this), 500);
    },
    stopVideo(index) {
      this.selectComponent(`#swiper${index}`).stop();
      // this.setData({
      //   [`swiperItem[${index}].isPlay`]: !this.data.swiperItem[index].isPlay
      // });
    },
    pauseVideo(index) {
      this.selectComponent(`#swiper${index}`).pause();
      // this.setData({
      //   [`swiperItem[${index}].isPlay`]: !this.data.swiperItem[index].isPlay
      // });
    },
    stopAllVideo() {
      if (!this.data.swiperItem) return;
      this.data.swiperItem.forEach((item, index) => {
        item.isVideo && this.stopVideo(index);
      });
    },
    pauseAllVideo() {
      if (!this.data.swiperItem) return;
      this.data.swiperItem.forEach((item, index) => {
        item.isVideo && this.pauseVideo(index);
      });
    },
    handleStopVideo({ currentTarget: { dataset: { index } } }) {
      // if (this.data.swiperItem[index].isPlay) this.stopVideo(index);
      this.stopVideo(index)
    },
    videoErrorCallback(e) {
      console.error(e)
    },
    /** 图片加载 */
    load({ currentTarget: { dataset: { index } } }) {
      this.setData({
        [`swiperItem[${index}].isLoad`]: true
      });
    },
    // 点击swiper事件
    handleClickSwiper() {
      console.log('handleClickSwiper');
    },
    handleFullScreen() {
      this.triggerEvent('full-screen');
    },
    handleProgressChange({ detail, currentTarget: { dataset: { index } } }) {
      this.setData({
        [`swiperItem[${index}].progress`]: detail
      });
    },
    handleClickOther({ detail: { isPlay, fullScreen, showOptions } }) {
      if (isPlay) {
        this.pauseVideo(0);
      } else {
        this.playVideo(0);
      }
    }
  }
})

