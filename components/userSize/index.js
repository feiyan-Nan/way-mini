const { globalData, uid, debounce, throttle, showToast } = getApp()
import { size } from '../../api/index'

Component({
  properties: {
    close: {
      type: Boolean,
      value: false
    },
    precise: {
      type: Array,
      value: []
    },
    picker: {
      type: Boolean,
      value: false
    },
    gender: {
      type: Boolean,
      value: true
    },
    distinction: {
      type: Boolean,
      value: true
    },
    // 是否显示完善信息提示
    basicTip: {
      type: Boolean,
      value: true
    },
    spuId: {
      type: String,
      value: null
    }
  },
  observers: {
    spuId(val) {
      console.log('spuId----------', val)
      this.spuId = val
    }
  },
  data: {
    site: null,
    genders: [{
      label: '女士',
      value: 2
    },{
      label: '男士',
      value: 1
    }, {
      label: '所有',
      value: 3
    }],
    form: {
      // sex: null,
      height: null,
      weight: null
    },
    isShowDialog: false,
    dialogs: {
      warning: false
    },
    value: [4],
    type: 'height',
    isUseInput: false,
    info: null,
    style: '',
    _advice: null,
    isMeasure: null,
    _title: '',
    _isFromMine: null,
    _currRouteIsLogin: null,
    _lastPageRoute: null,
    _hasText: null,
    _navHeight: null,
    _isShow: false
  },
  lifetimes: {
    ready: function() {
      this.init();
      this.defParams = {
        height: 0,
        weight: 0,
        sex: 0
        // chest: 0,
        // waist: 0,
        // hip: 0,
      };

      const query = wx.createSelectorQuery().in(this);
      query.select('.title').boundingClientRect(rect => {
        // console.log('title------****', rect)
        this.height = rect.height;
        this.setData({
          _navHeight: rect.height || 0
        });
      }).exec();
    },
    attached() {
      const [{ route: _lastRoute }] = getCurrentPages().slice(-2)
      const [{ route }] = getCurrentPages().slice(-1)
      console.log('route-----*****', route)
      console.log('_lastRoute-----*****', _lastRoute)
      this.route = route
      this.setData({
        isMeasure: route.includes('measure'),
        _isFromMine: _lastRoute.includes('mine'),
        _currRouteIsLogin: route.includes('login'),
        _lastPageRoute: _lastRoute.includes('goods-detail'),
        _isShow: true
      })
      this.onNetworkStatusChange()
    }
  },
  methods: {
    /** 监听网络变化 */
    onNetworkStatusChange () {
      wx.onNetworkStatusChange(res => {
        // console.log('onNetworkStatusChange', res)
        !Boolean(res.isConnected) && showToast('似乎已经断开了与互联网的连接')
      })
    },
    init () {
      this.makeSiteStyle()
      this.makeInfo()
      // const { spuId } = this.properties
      const spuId = this.spuId
      // console.log('spuId********((((())))))', spuId)
      wx.nextTick(async () => {
        if (!this.data.isMeasure) return
        // 获取用户身材信息
        // const res = await size.get_my_size({ uid: uid() })
        const res = await size[ spuId ? 'getSizeBySpu': 'get_my_size' ]({ uid: uid(), spuId })
        console.log('res获取用户身材信息', res)
        // const form = {uid: uid(), ...res.data}
        // 胸围 chest   腰围 waist   臀围 hip
        const { chest, height, weight, waist, hip } = res.data
        const _info = { chest, height, weight, waist, hip }
        const { adviceStatus, adviceSize } = res.data
        const _advice = { adviceStatus, adviceSize }
        this.setData({ _advice })
        Object.keys(_info) && Object.keys(_info)
          .filter(key => _info[key])
          .forEach(key => this.setData({
            [`info.${key}.value`]: _info[key],
            // 自动定位到指定位置
            [`info.${key}.startNum`]: this.data.info[key].range.findIndex(item => item === _info[key]),
            // 本地表单
            [`form.${key}`]: _info[key]
          }))

        setTimeout(() => {
          this.setData({
            _hasText: Object.values(this.data.form).some(item => Boolean(item))
          })
        })
      })
    },
    makeInfo () {
      const keys = ['height', 'weight', 'chest', 'waist', 'hip']
      const rangeMaps = new Map([
        ['height', [140, 200]],
        ['weight', [30, 100]],
        ['chest', [70, 130]],
        ['waist', [50, 120]],
        ['hip', [70, 130]],
      ])
      const startNumMaps = new Map([
        ['height', 165],
        ['weight', 50],
        ['chest', 90],
        ['waist', 75],
        ['hip', 90],
      ])
      const titleMaps = new Map([
        ['height', '身高'],
        ['weight', '体重'],
        ['chest', '胸围'],
        ['waist', '腰围'],
        ['hip', '臀围'],
      ])
      const findIndex = (range, num) => range.findIndex(item => item == num)
      let info = {}
      keys.forEach(key => {
        const range = this.makeRange(...rangeMaps.get(key))
        const title = titleMaps.get(key)
        const startNum = findIndex(range, startNumMaps.get(key))
        info[key] = { title, range, startNum }
      })
      this.setData({ info })
    },
    makeRange (s, e) {
      return [...new Array(e-s + 1).keys()].map(item => item + s)
    },
    makeSiteStyle () {
      const style = globalData.isX ? "padding-bottom: 60px;" : ''
      const {bottom} = wx.getMenuButtonBoundingClientRect()
      this.setData({ site: `height: ${bottom}px;`, style })
    },

    changeGender (e) {
      const { value } = e.currentTarget.dataset
      this.setData({ 'form.sex': value })
      this.createUserSize()
    },
    verify () {
      // const keys = this.getAllKeys()
      // console.log('keys.filter(item => Boolean(this.data.form[item]))', keys.filter(item => Boolean(this.data.form[item])))
      // return keys.filter(item => Boolean(this.data.form[item])).every(item => ['height', 'weight'].includes(item))
      return  ['height', 'weight'].every(key => this.data.form[key])
    },

    getAllKeys () {
      const { precise }  = this.properties
      const keys = Object.keys(this.data.form).concat(precise)
      console.log(keys)
      return keys
    },

    startFab () {
      // 如果断网的时候 直接返回上层逻辑
      if (!globalData.isConnected) {
        this.triggerEvent('startFab')
        return
      }
      if (!this.verify()) {
        this.setData({ 'dialogs.warning': true })
        return
      }
      this.triggerEvent('startFab')

    },
    handleOnTap(e) {
      e.detail ? this.setData({ 'dialogs.warning': false }) : this.triggerEvent('startFab')
    },
    handleChange (e) {
      const { value, mark } = e.detail
      this.setData({ [`form.${mark}`]: value })
      wx.nextTick(() => {
        this.setData({
          _hasText: Object.values(this.data.form).some(item => Boolean(item))
        })
      })
      if (this.data.isMeasure) {
        this.upDateRealTime(e.detail)
      } else {
        this.createUserSize()
      }
    },
    async upDateRealTime ({ value, mark }) {
      const spuId = this.spuId
      const params = { uid: uid(), [mark]: value, spuId }
      // const res = await size.update_my_size(params)
      const method = spuId ? 'upDateSizeBySpu': 'update_my_size'
      console.log('method', method)
      const res = await size[method](params)
      console.log('res', res)
      const { adviceStatus, adviceSize } = res.data
      const _advice = { adviceStatus, adviceSize }
      this.setData({ _advice })
      this.triggerEvent('upDate', res.data)
    },
    createUserSize: debounce(function() {
      wx.nextTick(async () => {
        const res = await size.create_user_size({
          uid: uid(),
          ...this.defParams,
          ...this.filter()
        })
        console.log('res', res.data)
        this.setData({
          _advice: res.data
        })
      })
    }, 500),
    changeTitle: throttle(function(_title) {
      this.setData({ _title })
    }, 50),
    filter () {
      let target = {}
      Object.keys(this.data.form).filter(key => this.data.form[key]).forEach(key => target[key]= Number(this.data.form[key]))
      return target
    },
    handleBack () {
      this.triggerEvent('back')
    },
    scroll(e) {
      const _title = e.detail.scrollTop >= this.height ? '获取专属Fabrique尺码' : ""
      if (_title !== this.data._title) {
        this.changeTitle(_title)
      }
    }

  }
});
