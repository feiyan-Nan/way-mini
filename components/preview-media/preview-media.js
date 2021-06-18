// pages/home/components/m-swiper/index.js
const computedBehavior = require('miniprogram-computed')
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
  behaviors: [computedBehavior],
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
    fullScreen: true
  },
  computed: {
    _tipCurrent(data) {
      if (!data.swiperItem || !data.swiperItem.length) return 0;
      return data.swiperItem[0].type == 'video' ? data.current : data.current + 1;
    },
    _tipTotal(data) {
      if (!data.swiperItem || !data.swiperItem.length) return 0;
      return data.swiperItem[0].type == 'video' ? data.swiperItem.length -1 : data.swiperItem.length
    },
  },
  lifetimes: {
    attached() {
      const { windowWidth } = wx.getSystemInfoSync();
      this.setData({
        _height: windowWidth / 2 * 3
      });

      if (this.data.swiperItem && this.data.swiperItem.length && this.data.swiperItem[0].type === 'video') {
        const { progress, duration } = this.data.swiperItem[0];
        // console.log('playVideo', progress, duration, this.data.swiperItem[0].isPlay);
        this.setData({
          [`swiperItem[0].initialTime`]: duration / 1000 * progress / 100
        });
        if (this.data.swiperItem[0].isPlay) {
          setTimeout(() => {
            this.stopAllVideo();
            this.playVideo(0);
          }, 100)
        } else {
          setTimeout(() => {
            this.selectComponent("#swiper0").videoContext.seek(duration / 1000 * progress / 100);
          }, 100);
        }
      }
      this.currentChange({ detail: { current: this.data.current } });
    },
    ready() {

      // 兼容视频放大闪一下第一帧
      // if (this.data.swiperItem && this.data.swiperItem.length && this.data.swiperItem[0].type === 'video') {
      //   if (this.data.swiperItem[0].isPlay) {
      //     this.stopAllVideo();
      //     this.selectComponent(`#swiper${0}`).play();
      //   }
      // }
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
        current: current,
        [`swiperItem[${current}].height`]: this.data.swiperItem[current].height,
        [`swiperItem[${current}].defaultY`]: this.data.swiperItem[current].defaultY,
        [`swiperItem[${current}].scale`]: 1,
        [`swiperItem[${current}].startLoadOrigin`]: true,
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
    clickOther({ detail: { isPlay, showOptions } }) {
      showOptions();
    },
    trogglePlay({ detail: { troggle }, currentTarget: { id, dataset: { index } } }) {
      this.setData({
        [`swiperItem[${index}].isPlay`]: typeof troggle !== 'boolean' ? !this.data.swiperItem[index].isPlay : troggle
      });
    },
    playVideo(index) {
      setTimeout((() => {
        // TODO 这里需要先关闭页面所有视频
        this.selectComponent(`#swiper${index}`).play();
      }).bind(this), 500);
      // this.setData({
      //   [`swiperItem[${index}].isPlay`]: !this.data.swiperItem[index].isPlay
      // });
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
    loadOrigin({ currentTarget: { dataset: { index } } }) {
      this.setData({
        [`swiperItem[${index}].isLoadOrigin`]: true
      });
    },
    /**
     * 双击图片放大
     */
    handleClickImg({ currentTarget: { dataset: { index } } }) {
      const timeStamp = new Date().getTime();
      let curTime = timeStamp;
      let lastTime = this.lastTapDiffTime || timeStamp - 301; // 未触发 则默认301秒前
      this.lastTapDiffTime = curTime;
      //两次点击间隔小于300ms, 认为是双击
      let diff = curTime - lastTime;
      if (diff > 300) {
        // 单击事件延时300毫秒执行，这和最初的浏览器的点击300ms延时有点像。
        this.tempTime = setTimeout(() => {
          this.tempIndex = null;
          this.exitFullScreen();
        }, 300);
      } else if (diff < 300 && diff > 100) {
        clearTimeout(this.tempTime); // 成功触发双击事件时，取消单击事件的执行
        this.tempIndex = null;
        const scale = this.data.swiperItem[index].scale;
        this.setData({
          [`swiperItem[${index}].scale`]: scale == 1 ? 3 : 1
        });
      }
    },
    // 防止在缩放的过程中触发handleClickImg，导致推出全屏
    handleTouchMove() {
      if (this.catchtap) {
        clearTimeout(this.catchtap);
      }
      this.catchTime = setTimeout(() => {
        clearTimeout(this.tempTime);
      }, 200);
    },
    // 点击swiper事件
    handleClickSwiper() {
      // console.log('handleClickSwiper');
    },
    // 点击图片 视频事件，组织冒泡
    catchtap({ currentTarget: { dataset: { index } } }) {
      // console.log('catchtap');
    },
    // 退出全屏按钮
    exitFullScreen() {
      this.triggerEvent('back', this.data.swiperItem);
      this.setData({
        [`swiperItem[${this.data.current}].scale`]: 1
      });
    },
    onChange() { },
    onScale({ detail: { scale }, currentTarget: { dataset: { index } } }) {
      if (scale !== 1) return;
      this.setData({
        [`swiperItem[${index}].scale`]: 1
      });
    },
    // 视频进度变更
    handleProgressChange({ detail, currentTarget: { dataset: { index } } }) {
      this.setData({
        [`swiperItem[${index}].progress`]: detail
      });
    },
    // 点击视频空白处
    handleCLickWhite() {
      this.exitFullScreen();
    }
  }
})

