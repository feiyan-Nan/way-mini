const computedBehavior = require('miniprogram-computed')

import imagesMap  from '../../utils/imagesMap'

Component({
  /**
   * 组件的属性列表
   */
  behaviors: [computedBehavior],

  properties: {
    size: {
      type: [String, Number],
      value: 44
    },

    src: {
      type: String,
      value: ''
    },

    name: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  // lifetimes: {
  //   attached() {
  //     console.log('imagesMap', imagesMap)
  //   }
  // },
  computed: {
    _size (data) {
      const { size } = data
      return size + 'rpx'
    },
    _name (data) {
      const { name, src } = data
      return src || imagesMap.get(name) || ''
    } 
  }
})
