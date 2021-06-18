Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    content: {
      type: String,
      value: ''
    },
    actions: {
      type: Array,
      value: ["取消", "确认"],
    },
    //第几个是被激活 或者 可以单独设置style
    destructive: {
      type: Number,
      value: 1
    },
    //激活按钮设置样式
    style: {
      type: String,
      value: 'color:#031C24;'
    },
    //是否是授权登录按钮
    isAuth: {
      type: String,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationData: null,
    maskAnimationData: null,
  },

  lifetimes: {
    attached() {
      //执行动画 ui让去掉动画
      // this.fadeDown();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onDialogTap(e) {
      const {index} = e.mark;
      //把消息发出去
      this.triggerEvent("onTap", index);
    },
    onAuth(e) {
      //把消息发出去
      this.triggerEvent("onAuth", e);
    },

    fadeDown() {
      /* 动画部分 */
      // 第1步：创建动画实例
      var animation = wx.createAnimation({
        duration: 150, //动画时长
        timingFunction: "ease-out", //线性
        delay: 0 //0则不延迟
      });

      // 第2步：这个动画实例赋给当前的动画实例
      this.animation = animation;

      // 第3步：执行第一组动画
      animation.scale(0.5).step().scale(0.6).step().scale(0.7).step().scale(0.8).step().scale(0.9).step().scale(1.0).step(100);

      // 第4步：导出动画对象赋给数据对象储存
      this.setData({
        animationData: animation.export(),
        maskAnimationData: animation.opacity(1.0).step().export(),
      })
    }
  }
})

