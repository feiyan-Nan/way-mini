// pages/home/components/m-swiper/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    swiperItem: Array,
    autoplay: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    indicatorDots: false, // 是否显示面板指示点
    vertical: false, // 滑动方向是否为纵向
    interval: 2000, // 持续时间
    circular: true, // 是否采用衔接滑动
    duration: 500,
    currentSwiper: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    currentChange({ detail: { current, source } }) {
      this.setData({
        currentSwiper: current
      })
    },
    clickItem({ currentTarget: { dataset: { index } } }) {
      this.triggerEvent('clickItem', {index});      
    }
  }
})

