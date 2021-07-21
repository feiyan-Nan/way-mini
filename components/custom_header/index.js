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
    _activeNum: 0,
    _images: [],
    _scrollLeft: 0
  },
  computed: {
    bigImg(data) {
      const { _activeNum, _images } = data
      return _images[_activeNum] ? _images[_activeNum].src : ''
    }
  },
  lifetimes: {
    attached () {
      const {  activeNum: _activeNum, images: _images } = this.properties
      
      this.setData({
        _activeNum,
        _images: _images.map(src => Object.assign({ id: 'id' + Math.random().toString(36).substr(-10), src }))
      })
    },
  },

  methods: {
    changeNum ({ mark }) {
      this.moveAndActive(mark.num)
    },

    moveAndActive (index) {
      const { _images } = this.data
      this.createSelectorQuery()
        .select('.scroll_view')
        .boundingClientRect()
        .select('.scroll_view')
        .scrollOffset()
        .select(`#${_images[index].id}`)
        .boundingClientRect()
        .exec(res => {
          const [ { width: boxWidth }, { scrollLeft }, { width: itemWidth, left: itemLeft } ] = res
          const half = ( boxWidth - itemWidth ) * 0.5
          const target = scrollLeft + itemLeft - half
          this.setData({
            _scrollLeft: target,
            _activeNum: index
          })
        })
    }
  }
})
