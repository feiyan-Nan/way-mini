Component({
  properties: {
    list: Array,
    activeIndex: {
      type: [Number, String],
      value: 0
    }
  },
  observers: {
    activeIndex (_activeIndex) {
      this.setData({ _activeIndex: Number(_activeIndex) })
    }
  },
  data: {
    _activeIndex: 0
  },
  lifetimes: {
    ready() {
      const item = this.data.list[this.data._activeIndex]
      this.triggerEvent('change', item)
    }
  },
  methods: {
    tapHandle (e) {
      const { index: _activeIndex } = e.currentTarget.dataset
      this.setData({ _activeIndex })
      this.triggerEvent('change', e.mark.item)
    }
  }
});
