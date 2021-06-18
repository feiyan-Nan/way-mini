import { fabs } from '../../../../api/index';
const { uid, isLogin, networkAct, surface, debounce } = getApp()
Component({
  data: {
    showOverflow: false,
    _item: null,
    _move: false,
    _current: 0
  },
  properties: {
    item: Object
  },
  observers: {
    item (_item) {
      this.setData({ _item })
    }
  },
  lifetimes: {
    attached() {

      this.createSelectorQuery().select('.markTip').boundingClientRect().exec(res => {
        console.log('但行字文字判断', res)
        const [{height: singleHeight}] = res

        this.createSelectorQuery().select('.tip').boundingClientRect().exec(res => {
          // console.log('文字判断', res)
          if (res[0].height > singleHeight) {
            this.setData({ showOverflow: true })
          }
        })
      })
    }
  },
  methods: {
    toSpuDetail (e) {
      networkAct(() => {
        const {id} = e.mark
        wx.navigateTo({
          url: '/pages/goods-detail/index?id=' + id
        })
      })
    },
    love () {
      if (this.working) return
      const _this = this
      networkAct(async() => {
        this.working = true
        if (isLogin()) {
          const { contId } = this.properties.item
          const likeRes = await fabs.like({ uid: uid(), contId })
          console.log('likeRes', likeRes)
          if (likeRes.code == 2000) {
            const _item = this.data._item
            let { cntLike } = _item
            Object.assign(_item, { isLike: 1, cntLike: cntLike + 1 })
            this.setData({ _item, _move: true })
          }
        } else {
          surface(wx.navigateTo, {
            url: '/pages/login/index',
            events: {
              // 登录成功后的回调
              onLoginSucc(data) {
                console.log('回调');
                surface(wx.navigateBack);
                _this.love()
              }
            },
          })
        }
        this.working = false
      })
    },
    cancel_like () {
      if (this.working) return
      const _this = this
      networkAct(async () => {
        this.working = true
        if (isLogin()) {
          const { contId } = this.properties.item
          const cancel_likeRes = await fabs.cancel_like({ uid: uid(), contId })
          if (cancel_likeRes.code == 2000) {
            const _item = this.data._item
            let { cntLike } = _item
            Object.assign(_item, { isLike: 0, cntLike: cntLike - 1 })
            this.setData({ _item, _move: false })
          }
        } else {
          surface(wx.navigateTo, {
            url: '/pages/login/index',
            events: {
              // 登录成功后的回调
              onLoginSucc(data) {
                console.log('回调');
                surface(wx.navigateBack);
                _this.cancel_like()
              }
            },
          })
        }
        this.working = false
      })
    },
    hideOverflow() {
      this.setData({
        showOverflow: false
      })
    },
    animationfinish (event) {
      // console.log('event', event)
      const { current: _current } = event.detail
      this.setData({ _current })
    }
  }
});
