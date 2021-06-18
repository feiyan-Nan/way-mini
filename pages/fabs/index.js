import { spuDetail, fabs } from '../../api/index';
const { uid, debounce, networkAct, throttle } = getApp()
Page({
  data: {
    fabs: [],
    scrollH: 0,
    targetIndex: null,
    isover: false,
    pageNum: 1,
    title: '',
    triggered: false
  },
  onLoad: function(options) {
    const pages = getCurrentPages();
    pages[pages.length - 2].isBack = true;
    this.getFabs().then(() => {
      const { index } = this.options
      const targetIndex = 'fabs' + index
      setTimeout(() => this.setData({ targetIndex }))
    })
    this.getNavBarInfo()

    this.createIntersectionObserver()
      .relativeTo('.scroll-view')
      .observe('.fabs_title', res => {
        const title = res.intersectionRatio > 0 ? '' : 'Fabs搭配灵感'
        if (title !== this.data.title) this.setData({ title })
      })

    setTimeout(() => {
      const _this = this
      this.createIntersectionObserver({
        observeAll: true,
        thresholds: [0.5]
      })
        .relativeTo('.scroll-view')
        .observe('.mark', _this.db)
    }, 500)
  },
  db: debounce(async function(res) {
    if(!uid()) return
    console.log('res---', res)
    const { contids: contIds } = res.dataset
    await fabs.readUpData({
      uid: uid(),
      contIds,
      src: 6
    })
  }, 1000),
  getNavBarInfo () {
    this.createSelectorQuery().select('.navbar').boundingClientRect().exec(res => {
      const { screenHeight } = wx.getSystemInfoSync()
      const [{ height }] = res
      const scrollH = screenHeight - height
      this.setData({ scrollH })
    })
  },
  async getFabs (isFresh) {
    if (this.data.isover && !isFresh) return
    return new Promise(async (resolve) => {
      let pageNum = isFresh ? 1 : this.data.pageNum
      const { spuId } = this.options
      const params = Object.assign({ spuId, pageNum }, uid() ? { uid: uid() } : null )
      pageNum++
      this.setData({ pageNum })
      this.selectComponent('#loading').show();
      const fabsRes = await spuDetail.getFabs(params)
      this.selectComponent('#loading').hide();
      // console.log('fabsRes', fabsRes)
      if (fabsRes.code == 2000) {
        const { screenWidth } = wx.getSystemInfoSync()
        const fabs = fabsRes.data
          .map(item => Object.assign(item, { imageSrc: JSON.parse(item.imageSrc) }))
          .map(item => {
            const imageSrc = item.imageSrc
              .map(it => {
                const { width, height } = it
                let localStyle

                if (width == height) {
                  localStyle = 'fangtu'
                } else {
                  if (width > height) {
                    localStyle = 'hengtu'
                  } else {
                    if (height / width < 1.5) {
                      localStyle = 'zishiying'
                    }

                    if (height / width == 1.5) {
                      localStyle = 'bili'
                    }

                    if (height / width > 1.5) {
                      localStyle = 'changtu'
                    }
                  }
                }

                // const localStyle = width > height ? 'hengtu': width == height ? 'fangtu': (height / width == 1.5) ? 'bili': (height / width) < 1.5 ? 'zishiying': 'feibili'
                return Object.assign(it, {localStyle})
              })
              .map(it => {
                const firstItem = item.imageSrc.filter((i, index) => index == 0)
                const [{ localStyle, height, width }] = firstItem
                let parentHeight

                if (['fangtu', 'hengtu'].includes(localStyle)) {
                  parentHeight = '100vw'
                }
                if (['changtu', 'bili'].includes(localStyle)) {
                  parentHeight = '150vw'
                }
                if (localStyle == 'zishiying') {
                  parentHeight = height * screenWidth / width + 'px'
                }
                // const parentStyle = ['fangtu', 'hengtu'].includes(localStyle) ? 'fangtu': 'bili'


                return Object.assign(it, { parentStyle: localStyle, parentHeight })
              })
            return Object.assign(item, { imageSrc })
          })

        const isover = fabs.length < 10
        this.setData({ fabs: isFresh ? fabs : this.data.fabs.concat(fabs), isover }, resolve)
      }
    })
  },
  scrolltolower: throttle(function() {
    this.getFabs()
  }, 300),

  refresherrestore() {
    this._freshing = false
  },

  refresherpulling () {
    networkAct(() => {
      console.log(11111)
      if (this._freshing) return
      this._freshing = true
    })
  },

  refresherabort () {
    console.log(33333333)
    this._freshing = false
    this.setData({ triggered: false })
  },

  touchend() {
    console.log(2222222)
    const _this = this
    if (this._freshing) {
      this.setData({
        pageNum: 1,
        isover: false
        // fabs: []
      }, async () => {
        await _this.getFabs(true)
        _this.setData({ triggered: false })
      })
    } else {
      _this.setData({ triggered: false })
    }
  },


  back () {
    wx.navigateBack()
  }
});