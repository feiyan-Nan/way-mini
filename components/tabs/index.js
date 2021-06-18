// components/tab/index.js
Component({
  options: {
    addGlobalClass: true,
    pureDataPattern: /^_/,
    multipleSlots: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: { type: Array, value: [] },
    orderNums: { type: Array, value: [] },
    tabClass: { type: String, value: '' },
    swiperClass: { type: String, value: '' },
    activeClass: { type: String, value: '' },
    tabUnderlineColor: { type: String, value: '#E88C73' },
    tabActiveTextColor: { type: String, value: '#FFFFFF' },
    tabInactiveTextColor: { type: String, value: '#97FFDD' },
    tabBackgroundColor: { type: String, value: 'transparent' },
    activeTab: { type: Number, value: 0 },
    swipeable: { type: Boolean, value: true },
    animation: { type: Boolean, value: true },
    duration: { type: Number, value: 500 },
  },

  /**
   * 组件的初始数据
   */

  data: {
    currentView: 0,
    height: 0,
  },
  observers: {
    activeTab: function activeTab(_activeTab) {
      var len = this.data.tabs.length;
      if (len === 0) return;
      var currentView = _activeTab - 1;
      if (currentView < 0) currentView = 0;
      if (currentView > len - 1) currentView = len - 1;
      this.setData({ currentView: currentView });
    },
  },
  lifetimes: {
    attached() {
      const menuRect = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
      // 定义导航栏的高度   方便对齐
      this.setData({
        height: wx.getSystemInfoSync().statusBarHeight,
      });
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTabClick: function handleTabClick(e) {
      var index = e.currentTarget.dataset.index;
      this.setData({ activeTab: index });
      this.triggerEvent('tabclick', { index: index });
    },
    handleSwiperChange: function handleSwiperChange(e) {
      var index = e.detail.current;
      this.setData({ activeTab: index });
      this.triggerEvent('change', { index: index });
    },
  },
});
