// pages/goods-detail/components/m-picker/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    range: {
      type: Array,
      value: []
    },
    rangeKey: {
      type: String,
      value: 'name'
    },
    selected: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false
    },
    sizeChatUrl: String,
    sizeTips: String,
    intoNUm: String
  },
  observers: {
    'show': function (value) {
      if (value) {
        setTimeout(() => {
          this.setData({
            _showClose: value
          });
        }, 400);
      }
      this.setData({
        _show: value,
        _showClose: value ? this.data._showClose : value
      });
    },
    range (range) {
      const { selected } = this.properties
      const length = range.length
      const num = Math.floor( length/ 2 )
      const floor = (!selected && length >= 5) ? num - 2 : num
      const _into = selected ? (selected != '0' ? `picker-${ Number(selected) - 1 }` : null) : `picker-${ floor }`
      wx.nextTick(() => {
        this.setData({ _into })
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    // current: 0,
    _show: false,
    _showClose: false,
    _ani: null,
    _into: null
  },
  lifetimes: {
    attached() {
      this.animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
        delay: 100
      });
      this.animation.height(0).step();
      this.setData({
        _ani: this.animation.export()
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.triggerEvent("close");
    },
    change({ detail: { value } }) {
      this.setData({
        current: value
      });
      this.triggerEvent("change", value);
    },
    clickItem({currentTarget:{dataset: {index,item}}}) {
      this.triggerEvent("change", [index]);
    }
  }
})
