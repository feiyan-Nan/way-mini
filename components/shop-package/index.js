// components/shop-package/index.js
import { bag } from '../../api/index';
const { getUserInfo } = getApp()
Component({
  optionis: {
    styleIsolation: 'shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    shopCarNums: {
      type: Number,
      value: 0
    },
    bottom: {
      type: String,
      value: ''
    },
    right: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'bag'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 0
  },
  pageLifetimes: {
    show() {
      this.upDateBagCount()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async upDateBagCount ( isShowLoading ) {
      if (this.properties.type != 'bag') return
      const userInfo = getUserInfo();
      if (!userInfo) {
        return;
      }
      isShowLoading && this.selectComponent('#loading') .show()
      const res = await bag.getCartListCount({ uid: userInfo.uid });
      isShowLoading && this.selectComponent('#loading') .hide()
      if (res.code === 2000) {
        // TODO 获取nums
        this.setData({ num: res.data })
      }
    }
  }
})
