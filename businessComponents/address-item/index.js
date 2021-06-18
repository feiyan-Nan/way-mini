const { networkAct, throttle } = getApp();
Component({
  properties: {
    address: {
      type: Object,
      value: {},
    },
    isEllipsis: {
      type: Boolean,
      value: true,
    },
    iconName: {
      type: String,
      value: 'edit',
    },
  },
  data: {
    src: '',
  },
  lifetimes: {
    attached() {
      this.setData({
        src: `/assets/images/shipping-address/${this.properties.iconName}.png`,
      });
    },
  },
  methods: {
    handleEditShippingAddress: throttle(function (e) {
      networkAct(() => this.triggerEvent('handleClickIcon', e));
    }),
  },
});
