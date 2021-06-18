Component({
  properties: {
    type: {
      type: String,
      value: 'weight'
    },
    startNum: {
      type: Number,
      value: 0
    },
    title: {
      type: String,
      value: ''
    },
    range: Array,
    unit: String
  },
  data: {
    _index: 0
  },
  lifetimes: {
    ready() {
      const _index = this.properties.startNum
      this._index = _index
      this.setData({ _index })
    }
  },
  methods: {
    change(e) {
      const [_index]= e.detail.value
      this._index = _index
      this.setData({ _index})
    },
    ok () {
      this.triggerEvent('ok', this._index)
      this.cancel()
    },
    cancel () {
      this.selectComponent('.custom_mask').hide()
    },
    show () {
      this.selectComponent('.custom_mask').show()
    },
    handleMaskHide() {
      this.triggerEvent('maskHide')
    }
  }
});
