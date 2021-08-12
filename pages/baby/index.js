const computedBehavior = require('miniprogram-computed')

import { baby } from '../../api/index';

const { showToast } = getApp()


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
  goDown () {
    const _this = this
    const { system } = wx.getSystemInfoSync()
    const iosUrl = 'https://apps.apple.com/cn/app/%E6%88%91%E9%A1%BA%E8%B7%AF-%E5%87%BA%E8%A1%8C%E8%B7%AF%E4%B8%8A%E6%90%AD%E8%AE%AA%E7%A4%BE%E4%BA%A4%E8%BD%AF%E4%BB%B6/id1459021326'
    const androidUrl = 'https://a.app.qq.com/o/simple.jsp?pkgname=com.example.shulu&g_f=1000047'
    const data = system.startsWith('iOS') ? iosUrl : androidUrl
    wx.setClipboardData({
      data,
      success() {
        showToast('粘贴到浏览器下载')
        _this.closeMask()
      }
    })
  },

  saveFile () {
    wx.downloadFile({
      url: `https://oss.guangmangapp.com/101a33e3-bb58-490d-b949-eac28ce32a2e.png`,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功!',
            })
          },
          fail: function (err) {
            if (err.errMsg === "saveImageToPhotosAlbum:fail cancel") {
              wx.showToast({
                title: '保存失败!',
                icon: 'none'
              })
            }
          },
        })
      },
      fail(err) {
        wx.showModal({
          title: '文件下载错误',
          content: err.errMsg,
        })
      }
    })
  },

  changeNav(e) {
    console.log(e)
  },

  handleBack() {
    wx.navigateBack()
  }
})