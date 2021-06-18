const { formatThousands } = getApp();
Component({
  properties: {
    productDetails: {
      type: Object,
      value: {},
    },
  },
  data: {
    price: '',
  },
  methods: {},
  lifetimes: {
    attached: function () {
      this.setData({
        price: formatThousands(this.properties.productDetails.skuRmbPriceStr),
      });
    },
  },
});
