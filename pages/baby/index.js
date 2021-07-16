const computedBehavior = require('miniprogram-computed')

import { baby } from '../../api/index';


Page({

  /**
   * 页面的初始数据
   */
  behaviors: [computedBehavior],

  data: {
    userInfoDTO: {}
  },

  computed: {
    images (data) {
      const { userInfoDTO } = data
      return Reflect.has(userInfoDTO, 'imgList') ? userInfoDTO.imgList.split(',').filter(i => i) : []
    },

    isHaveImages (data) {
      const { userInfoDTO } = data
      return Reflect.has(userInfoDTO, 'imgList')
    }
  },

  async onLoad (options) {
    console.log('options', options)
    const { id: toUid } = options
    const { c, d } = await baby.getDetail({ toUid })
    if (c != 0) return
    const { userInfoDTO } = d.userShowDTO
    this.setData({
      userInfoDTO
    })
  },

  openMask () {
    this.selectComponent('.pubmask').show()
  },

  closeMask () {
    this.selectComponent('.pubmask').toggle()
  },

  changeNav(e) {
    console.log(e)
  },

  handleBack() {
    wx.navigateBack()
  }
})