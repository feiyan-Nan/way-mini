// pages/add-shipping-address/components/time_picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    range: Array,
    value: Number,
    animation: null
  },

  /**
   * 组件的初始数据
   */
  data: {
    provinces: [],
    citys: [],
    countrys: [],
    _value: [0, 0, 0]
  },
  observers: {
    range (newVal) {
      const [ provinces, citys, countrys ] = newVal
      this.setData({ provinces, citys, countrys })
    }
  },
  lifetimes: {
    attached() {
      const animation = wx.createAnimation().translateY(0).step({ duration: 200 }).export()
      this.setData({ animation })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onchange (e) {
      console.log('@@@@', e.detail.value)
      const { value } = e.detail
      const { _value } = this.data
      const column = value.findIndex((item, index) => item != _value[index])
      const target = {
        column,
        value: value[column]
      }


      if (column != -1) {

        let local_value = []
        switch (column) {
          case 0:
            // local_value = [0, 0, 0]
            this.setData({
              _value: [0, 0, 0]
            })
          case 1:
            // local_value = [_value[0], 0, 0]
            this.setData({
              ['_value[2]']: 0,
            })
        }


        // this.setData({
        //   _value: local_value
        // })
        this.triggerEvent('columnchange', target)
      }
      this.setData({ _value: value })
    }
  }
})
