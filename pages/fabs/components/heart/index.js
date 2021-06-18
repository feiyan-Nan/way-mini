const { debounce, throttle } = getApp()

Component({
  properties: {
    cntLike: Number,
    isLike: Boolean,
  },
  observers: {
    move (val) {
      console.log('move---------', val)
    }
  },
  data: {},
  methods: {
    tapHandle: throttle(function() {
      const { isLike } = this.properties
      isLike ? this.triggerEvent('cancel_like'): this.triggerEvent('love')
    }, 200)
  }
});
