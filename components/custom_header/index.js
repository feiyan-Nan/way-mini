const computedBehavior = require('miniprogram-computed')


Component({
  /**
   * 组件的属性列表
   */
  behaviors: [computedBehavior],

  properties: {
    pure: {
      type: Boolean,
      value: false
    },
    images: {
      type: [Array],
      value: []
    },

    activeNum: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // tmpImg: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
    _activeNum: 0,
    _images: []
  },
  computed: {
    bigImg(data) {
      const { _activeNum, _images } = data
      console.log('_images[_activeNum]', _images[_activeNum])
      return _images[_activeNum] ? _images[_activeNum].src : ''
    }
  },
  lifetimes: {
    attached () {
      const {  activeNum: _activeNum, images: _images } = this.properties
      
      this.setData({
        _activeNum,
        _images: _images.map(src => Object.assign({ id: 'id' + Math.random().toString(36).substr(-10), src }))
      }, () => {
        console.log('_images', this.data._images)
      })
    }
  },

  methods: {
    changeNum ({ mark }) {
      console.log('mark', mark)
      this.setData({
        _activeNum: mark.num
      })
    }
  }
})
