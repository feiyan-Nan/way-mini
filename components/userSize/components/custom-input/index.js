const { showToast } = getApp()
Component({
  properties: {
    picker: {
      type: Boolean,
      value: false
    },
    unit: {
      type: String,
      value: 'cm'
    },
    placeholder: {
      type: String,
      value: "请输入"
    },
    range: Array,
    title: String,
    mark: String,
    value: {
      type: Number,
      optionalTypes: [String],
      value: null
    },
    startNum: {
      type: Number,
      value: 0
    }
  },
  observers: {
    value(_value) {
      this.setData({ _value: _value || null })
    },
    startNum(_startNum) {
      this.setData({ _startNum })
    },
  },
  data: {
    _value: null,
    _fouce: false,
    _isShowMask: false,
    _startNum: 0
  },
  methods: {
    inputHandle(e) {
      const { mark } = this.properties
      let _value = e.detail.value || null
      const legal = !/[^0-9]/i.test( _value )
      if( _value && !legal ) {
        _value = _value.replace(/[^0-9]/ig, '')
        showToast('不支持小数和3位以上的数字哦')
      }
      this.setData({ _value })
      this.triggerEvent('change', { value: _value, mark, legal })
    },
    handleTap () {
      if (this.properties.picker) {
        this.setData({ _isShowMask: true },() => this.selectComponent('.mask').show())
      } else {
        this.setData({ _focus: true })
      }
    },
    handleOk(e) {
      const index = e.detail
      const { range, mark } = this.properties
      // 数据双向绑定
      const _value = range[index]
      this.setData({ _value, _startNum: index })
      this.triggerEvent('change', { value: _value, mark, legal: true })
    },
    maskHide() {
      this.setData({ _isShowMask: false })
    }
  }
});
