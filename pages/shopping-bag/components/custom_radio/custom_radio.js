Component({
  properties: {
    type: {
      type: String,
      value: 'unselected'
    }
  },
  data: {
    list: [{
      url: '/assets/images/shopping-bag/unselected@2x.png',
      type: 'unselected'
    },  {
      url: '/assets/images/shopping-bag/selected@2x.png',
      type: 'selected'
    },  {
      url: '/assets/images/shopping-bag/warning@2x.png',
      type: 'warning'
    }],
    url: '',
    localType: 'unselected'
  },
  lifetimes: {
    attached() {
      this.init(this.properties.type)
    }
  },
  observers: {
    type (val) {
      this.init(val)
    }
  },
  methods: {
    init (type) {
      const { url, type: localType } = this.data.list.find(item => item.type == type)
      this.setData({ url, localType })
    },
    change () {
      if (this.properties.type == 'warning') return
      const type = this.data.localType == 'selected' ? 'unselected': 'selected'
      this.init(type)
      this.triggerEvent('change', type)
    }
  }
});
