// components/video/index.js
const { surface, showToast, globalData } = getApp();
const computedBehavior = require('miniprogram-computed')
const { debounce, throttle } = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: ''
    },
    width: {
      type: String,
      value: '320px'
    },
    height: {
      type: String,
      value: '225px'
    },
    isPlay: {
      type: Boolean,
      value: false
    },
    fullScreen: {
      type: Boolean,
      value: false
    },
    videoId: {
      type: String,
      value: ''
    },
    coverImage: {
      type: String,
      value: ''
    },
    objectFit: {
      type: String,
      value: 'cover'
    },
    initialTime: {
      type: Number,
      value: 0
    },
    enableAutoRotation: {
      type: Boolean,
      value: false
    },
    showFullScreen: {
      type: Boolean,
      value: false
    },
    customFullScreen: {
      type: Boolean,
      value: false
    },
    showCenterPlayBtn: {
      type: Boolean,
      value: false
    },
    showPlayBtn: {
      type: Boolean,
      value: false
    },
    showMuteBtn: {
      type: Boolean,
      value: false
    },
    showScreenLockButton: {
      type: Boolean,
      value: false
    },
    userCustom: {
      type: Boolean,
      value: false
    },
    duration: {
      type: Number,
      value: 0
    },
    controls: {
      type: Boolean,
      value: false
    },
    showSystemControls: {
      type: Boolean,
      value: false
    },
    controlsBottom: {
      type: Number,
      value: 40
    },
    bgColor: {
      type: String,
      value: '#000000;'
    },
    autoPlay: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    progress: 0,
    sliderProgress: 0,
    sliderStart: "00:00",
    sliderEnd: "00:00",
    sliderChanging: false,
    showOptions: false
  },
  behaviors: [computedBehavior],
  computed: {
    _showOptions(data) {
      return !data.isPlay;
    },
  },
  observers: {
    height (val) {
      console.log('height----', val)
    }
  },
  lifetimes: {
    attached: function () {
      // console.log('duration', this.data.duration)
      // console.log('initialTime', this.data.initialTime);
      // console.log('enableAutoRotation', this.data.enableAutoRotation);
      this.videoContext = wx.createVideoContext(this.data.videoId, this);
      this.triggerEvent('progress-change', 0);
      this.setData({
        sliderEnd: this.getTimeStr(this.data.duration)
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
    async showTip() {
      if (this.hideTip || globalData.playedVideo) return;
      const { networkType } = await surface(wx.getNetworkType);
      if (networkType !== 'wifi') {
        globalData.playedVideo = true;
        // console.log('非Wi-Fi网络，请注意流量消耗');
        showToast('非Wi-Fi网络，请注意流量消耗');
      }
    },
    handleClickOther() {
      const that = this;
      this.triggerEvent('clickOther', {
        isPlay: this.data.isPlay,
        fullScreen: this.data.fullScreen,
        showOptions() {
          that.setData({
            showOptions: !that.data.showOptions
          });
          that.delayHideOptions();
        }
      });
    },
    // 延迟关闭视频控制层
    delayHideOptions(time = 3000) {
      if (this.delayTime) {
        clearTimeout(this.delayTime);
      }
      this.delayTime = setTimeout(() => {
        this.setData({
          showOptions: false
        });
      }, time);
    },
    trogglePlay({ currentTarget: { dataset: { byPlay } } }) {
      if (this.data.isPlay) this.pause(!byPlay);
      else this.play(!byPlay);
    },
    play(clickOther) {
      // console.log('video', 'handlePlay', this.data.isPlay, this.data.src);
      if (this.data.isPlay) return;
      this.videoContext.play();
      this.setData({
        isPlay: true
      });
      this.triggerEvent('trogglePlay', {
        troggle: true,
        clickOther
      });
      this.showTip();
    },
    stop(clickOther) {
      // console.log('video', 'handleStop', this.data.isPlay, this);
      this.videoContext.stop();
      if (!this.data.isPlay) return;
      this.setData({
        isPlay: false
      });
      this.triggerEvent('trogglePlay', {
        troggle: false,
        clickOther
      });
    },
    pause(clickOther) {
      // console.log('video', 'handlePause');
      if (!this.data.isPlay) return;
      // console.log('video', 'pause');
      this.videoContext.pause();
      setTimeout(this.videoContext.pause, 500)
      this.setData({
        isPlay: false
      });
      this.triggerEvent('trogglePlay', {
        troggle: false,
        clickOther
      });
    },
    handleStop() {
      this.pause();
    },
    handleTimeupdate({ detail: { currentTime, duration } }) {
      // console.log(currentTime, duration)
      const progress = currentTime / duration * 100;
      if (!this.data.sliderChanging) {
        this.setData({ progress, sliderProgress: progress, sliderStart: this.getTimeStr(currentTime) });
      }
      this.triggerEvent('progress-change', progress);
    },
    handleEnd() {
      this.stop();
      this.triggerEvent('progress-change', 0);
      this.setData({
        progress: 0,
        sliderProgress: 0,
        sliderStart: "00:00",
        initialTime: 0.01,
        showOptions: true
      });
      // this.videoContext.seek(0.01);
      setTimeout(() => {
        // Android 没有wifi 无法自动加载
        this.play();
        this.stop();
        this.setData({
          isPlay: false
        });
      }, 100)
      this.delayHideOptions();
    },
    handlePause() {
      this.setData({
        isPlay: false
      });
    },
    handlePlay() {
      this.showTip();
      this.setData({
        isPlay: true,
        showOptions: true
      });
      this.delayHideOptions();
      const { videoId } = this.properties
      this.triggerEvent('videoPlay', { videoId })
    },
    // 全屏状态变更
    handleFullScreenChange({ detail: { fullScreen, direction } }) {
      this.triggerEvent('full-screen', fullScreen);
      this.setData({
        fullScreen
      });
    },
    // 点击全屏按钮
    handleFullScreen() {
      if (this.data.customFullScreen) {
        this.triggerEvent('full-screen', true);
        return;
      }
      this.videoContext.requestFullScreen();
      if (this.data.isPlay) {
        this.setData({
          isPlay: false
        });
        setTimeout(() => {
          this.play();
        }, 100)
      } else if (this.data.autoPlay){
        setTimeout(() => {
          this.hideTip = true;
          this.play();
          this.stop();
        }, 100)
        setTimeout(() => {
          this.hideTip = false;
        }, 300)
      }
    },
    handleFullScreenExit() {
      this.clickWhite();
    },
    // 控制组件状态变更 自带controls
    handleControlsToggle({ detail: { show } }) {
      this.setData({
        showOptions: show
      });
    },
    // 点击空白处（非视频区域）
    clickWhite() {
      this.triggerEvent('click-white');
    },
    // 自定义进度条完成拖动
    handleProgressChanged({ detail: { value } }) {
      // console.log(value, this.data.duration, this.data.duration * value / 100);
      this.videoContext.seek(this.data.duration * value / 100);
      this.setData({
        sliderProgress: value,
        sliderChanging: false
      });
      this.triggerEvent('progress-change', value);
    },
    // 自定义进度条拖动中
    // handleProgressChanging({ detail: { value } }) {
    //   this.setData({
    //     sliderStart: this.getTimeStr(this.data.duration * value / 100),
    //     sliderChanging: true
    //   });
    // },
    handleProgressChanging: throttle(function({ detail: { value } }) {
      this.setData({
        sliderStart: this.getTimeStr(this.data.duration * value / 100),
        sliderChanging: true
      });
    }),
    // 将时长（s）转化成 xx:xx 格式
    getTimeStr(duration) {
      duration = Math.floor(duration);
      if (duration >= 60 * 100) {
        return "99:59";
      } else if (duration >= 60) {
        const min = Math.floor(duration / 60);
        const second = duration % 60;
        return `${min < 10 ? '0' + min : min}:${second < 10 ? '0' + second : second}`
      } else {
        return `00:${duration < 10 ? '0' + duration : duration}`
      }
    },
    handleClickProgress() { }
  }
})
