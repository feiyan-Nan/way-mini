// pages/goods-detail/components/m-bottom/index.js
const computedBehavior = require('miniprogram-computed')
const { showToast, getUserInfo, surface, globalData, checkConnected } = getApp();
const qiyu_botton = require('../../../../behaviors/qiyu_botton')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sizeArr: {
      type: Array,
      value: []
    },
    sizeIndex: {
      type: String,
      value: ''
    },
    showStat: {
      type: Boolean,
      value: 0
    },
    isLogged: {
      type: Boolean,
      value: false
    },
    sizeChatUrl: String,
    sizeTips: String
  },
  behaviors: [computedBehavior, qiyu_botton],
  computed: {
    _showStat(data) {
      if (data.showChooseSize) {
        if (!data.sizeArr[data.sizeIndex]) return true;
        const { showStat, stockNum } = data.sizeArr[data.sizeIndex];
        return showStat && stockNum > 0;
      } else {
        return data.showStat;
      }
    },
    buttonType(data) {
      const { _showStat, singleChooseSize, showChooseSize } = data;
      if (!_showStat || singleChooseSize) return 'singleButton';
      else return 'doubleButton';
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showChooseSize: false, // 是否显示自定义picker
    singleChooseSize: false,
    chooseType: '', // 未选尺码，点击底部按钮 类型
    isX: false
  },
  lifetimes: {
    attached() {
      const isX = globalData.isX
      this.setData({ isX })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** ------------尺码选择相关 -------------- */
    /**显示尺码弹框 */
    showSize() {
      this.setData({
        showChooseSize: true,
        singleChooseSize: false
      });
    },
    /**隐藏尺码弹框 */
    handleHiddenSize() {
      this.hidePicker();
    },
    /** 尺码弹框滚动选中 */
    handleSizeChange({ detail: [value] }) {
      console.log('handleSizeChange', value, this.data.sizeIndex);
      value = String(value);
      const item = this.data.sizeArr[value];
      if (!item || !item.showStat || item.stockNum <= 0) return;
      this.setData({
        sizeIndex: this.data.sizeIndex === value ? '' : value
      });
    },
    /** 尺码弹框点击确定 */
    handleChooseSize() {
      if (!this.data._showStat) return;
      if (this.data.sizeIndex === '') {
        showToast('请选择尺码');
        return;
      }
      // console.log(`handleChooseSize 选择当尺码 点击${this.data.chooseType === 'pay' ? '立即购买' : '加入购物车'}`, this.data.sizeArr[this.data.sizeIndex]);
      this.triggerEvent(this.data.chooseType === 'pay' ? 'pay' : 'addCar', {
        index: this.data.sizeIndex,
        data: this.data.sizeArr[this.data.sizeIndex]
      });
      this.hidePicker();
    },
    /** 加入购物车 */
    addShopCar(e) {
      this._buttonBtnEvent('car', (function () {
        this.triggerEvent('addCar', {
          index: this.data.sizeIndex,
          data: this.data.sizeArr[this.data.sizeIndex]
        });
      }).bind(this));
    },
    /** 立即购买 */
    handlePay() {
      this._buttonBtnEvent('pay', (function () {
        this.triggerEvent('pay', {
          index: this.data.sizeIndex,
          data: this.data.sizeArr[this.data.sizeIndex]
        });
      }).bind(this));
    },
    _buttonBtnEvent(chooseType, fn) {
      const { showChooseSize, sizeIndex, sizeArr } = this.data;
      if (showChooseSize) { // 点击选择尺码触发弹框，点击按钮
        if (sizeIndex === '') {
          showToast('请选择尺码');
          return;
        }
        fn(); // 事件处理
        this.hidePicker();
        return;
      }
      // else if (this.data.sizeIndex !== '') { // 已经选择尺码，点击按钮
      //   // console.log('handlePay 选择当尺码 点击按钮', sizeIndex, sizeArr[sizeIndex]);
      //   fn(); // 事件处理
      // }
      else { // 未选择尺码，点击立即购买
        this.setData({
          showChooseSize: true,
          singleChooseSize: true,
          chooseType
        });
      }
    },
    bottomButtonClick(e) {
      if (!this.data._showStat) return;
      if (this.data.buttonType === 'doubleButton') {
        this.handlePay(e);
      } else {
        this.handleChooseSize(e);
      }
    },
    /** ------------尺码选择相关end-------------- */
    maskClick() {
      this.hidePicker();
    },
    hidePicker() {
      this.setData({
        showChooseSize: false,
        singleChooseSize: false,
        sizeIndex: ''
      });
    },
    async toLogin() {
      await checkConnected();
      const userInfo = getUserInfo();
      if (!userInfo) {
        surface(wx.navigateTo, {
          url: '/pages/login/index',
          events: {
            onLoginSucc: (function() {
              surface(wx.navigateBack, {delta: 1});
            }).bind(this)
          }
        });
        return;
      }
    }
  }
})
