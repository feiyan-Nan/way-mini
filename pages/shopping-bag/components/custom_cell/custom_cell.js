// pages/shopping-bag/components/custom_cell/custom_cell.js
const { formatThousands, networkAct } = getApp()
Component({
  /**
   * 组件的属性列表
   */
  options: {
    pureDataPattern: /^index$/
  },
  properties: {
    isDead: {
      type: Boolean,
      value: false
    },
    detail: {
      type: Object,
      value: {}
    },
    type: {
      type: String,
      value: 'unselected'
    },
    index: {
      type: Number
    },
    show: {
      type: Boolean,
      value: false

    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    slideButtons: [{
      text: '移除',
      type: 'warn',
      extClass: 'remove'
    }],
    tmpUrl: '/assets/images/shopping-bag/tmp.png',
    localTyle: 'unselected',
    _desc: ''
  },

  observers: {
    type (val) {
      this.init(val)
    },
    detail(val) {
      // console.log('detail', val)
      const { desc, skuDesc } = val
      const _desc = desc || skuDesc
      this.setData({ _desc })
    }
  },

  lifetimes: {
    attached() {
      this.init(this.properties.type)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init (type) {
      const { isDead } = this.properties
      this.setData({ localTyle: isDead ? 'warning' : type })
    },
    goToDetail () {
      // if (this.properties.isDead) return
      networkAct(() => {
        console.log('this.properties.detail', this.properties.detail)
        const { spuId: id } = this.properties.detail
        wx.navigateTo({
          url: '/pages/goods-detail/index?id=' + id
        })
      })
    },
    slideButtonTap (e) {
      networkAct(() => {
        const { index, detail, isDead } = this.properties
        this.triggerEvent('slideButtonTap', { index, detail, isDead })
      })
    },
    showEvent (e) {
      const { index, detail, isDead } = this.properties
      this.triggerEvent('showEvent', { index, detail, isDead })
    },
    change (e) {
      networkAct(() => {
        const { detail } = e
        const { index } = this.properties
        this.triggerEvent('change',{ index, detail })
      })
    },
    sub () {
      const { index, detail } = this.properties
      networkAct(() => {
        console.log('sub', detail.num)
        if (detail.num == 1) return
        this.triggerEvent('sub', { index })
      })
    },
    add () {
      const { index, detail } = this.properties
      networkAct(() => {
        console.log('add')
        if (detail.skuStockNum == detail.num) return
        this.triggerEvent('add', { index })
      })
    },
    reselect () {
      networkAct(() => {
        console.log('reselect')
        const { index, detail } = this.properties
        // if (detail.)
        this.triggerEvent('reselect', { index })
      })
    }
  }
})
