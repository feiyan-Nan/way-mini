// pages/shopping-bag/index.js
const { debounce, networkAct, surface, showToast, getUserInfo, nextTick, globalData, checkConnected } = getApp()
import { bag, orderApi } from '../../api/index';
Page({
  options: {
    pureDataPattern: /^_/
  },
  /**
   * 页面的初始数据
   */
  data: {
    slideButtons: [{
      text: '移除',
      type: 'warn',
      extClass: 'remove'
    }],
    isShow: false,
    distance: 0,
    showRemoveAllDialog: false,
    showRemoveSingDialog: false,
    list: [],
    invalids: [],
    headerTitle: '',
    _willDelSingIndex: null,
    _willDelSingType: null,
    totalPrice: 0,
    radioStatus: 'unselected',
    range: [],
    pickerSelectedNum: 0,
    userInfo: null,
    selectedItemLength: 0,
    buttonText: '去结算',
    _index: null,
    serviceDesc: null,
    ani: null,
    sizeInfo: null,
    display: false
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow () {
    this.init()
  },
  onLoad () {
    this.animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
      delay: 100
    });
    this.animation.height(0).step();
    this.setData({
      ani: this.animation.export()
    });
  },
  init() {
    this.getList()
    this.makeTitle()
    const userInfo = getUserInfo()
    this.setData({ userInfo })
  },
  makeTitle () {
    const menuRect = wx.getMenuButtonBoundingClientRect()
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    const menuDistanc = menuRect.top + menuRect.height + statusBarHeight
    const query = wx.createSelectorQuery()
    query.select('#title').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(res => {
      const [titleBounding] = res
      const distance = titleBounding.height + titleBounding.top - menuDistanc
      this.setData({ distance })
    })
  },
  async getList () {
    const { uid } = getUserInfo()
    const res = await bag.getCartList({ uid, pageNum: 1 })
    if (res.code != 2000) return
    const { shopCartSkuVos, serviceDesc } = res.data
    const list = shopCartSkuVos.filter(item => !item.invalidStatus).map(item => Object.assign({}, item, {type: 'unselected', show: false}))
    const invalids = shopCartSkuVos.filter(item => item.invalidStatus).map(item => Object.assign({}, item, { show: false }))
    this.setData({ list, invalids, isShow: true, serviceDesc }, this.makeBillsAndWatchRadio)

    console.log('list--------------------', list)
    console.log('invalids--------------------', invalids)
    // this.selectComponent('#loading').show()
  },
  onPageScroll (e) {
    const headerTitle = e.scrollTop >= this.data.distance ? '购物袋' : ''
    if (headerTitle == this.data.headerTitle) return
    debounce( this.setData({ headerTitle }) )
  },
  goBack () {
    surface(wx.navigateBack)
  },
  change (e) {
    const { detail, index } = e.detail
    this.setData({ [`list[${index}].type`]: detail }, this.makeBillsAndWatchRadio)
  },
  removeAll () {
    networkAct(async () => {
      this.selectComponent('#loading').show()
      const res = await bag.delAllInvalidSku({ uid: this.data.userInfo.uid })
      if (res.code == 2000) {
        const list = this.data.list.filter(item => !item.invalidStatus)
        this.setData({ list, invalids: [] })
      }
      this.selectComponent('#loading').hide()
    })
  },
  async handleToPay () {
    await checkConnected()
    globalData.birthPlace = 'shopping-bag'
    if (!this.data.totalPrice) {
      showToast('请选择要结算的单品')
      return
    }
    const { uid } = getUserInfo()
    const orderItems = this.data.list.filter(item => item.type == 'selected')
    const { code, msg } = await orderApi.createOrder({ uid, orderItems })
    if (code != 2000) {
      showToast(msg)
      this.init()
      return
    }
    const res = await surface(wx.navigateTo, { url: '/pages/confirm-order/index' })
    res.eventChannel.emit('acceptOrderSkuPage', { orderItems, uid })
    // 清除选中状态
    nextTick(() => {
      const list = this.data.list.map(item => Object.assign({}, item, {type: 'unselected'}))
      this.setData({ list }, this.makeBillsAndWatchRadio)
    })
  },
  openRemoveAllDialog () {
    networkAct(() => {
      this.setData({ showRemoveAllDialog: true })
    })
  },
  onRemoveAllTap (e) {
    const { detail: isDelete } = e
    if (isDelete) {
      this.removeAll()
    }
    this.setData({ showRemoveAllDialog: false })
  },
  openRemoveSingDialog () {
    this.setData({ showRemoveSingDialog: true })
  },
  onRemoveSingTap (e) {
    const { detail: isDelete } = e
    if (isDelete) {
      this.remove()
    }
    this.setData({ showRemoveSingDialog: false })
  },
  allSelectChange () {
    const type = this.data.radioStatus == 'selected' ? 'unselected' : 'selected'
    const list = this.data.list.map(item => Object.assign(item, { type }))
    this.setData({ list }, this.makeBillsAndWatchRadio)
  },
  makeBillsAndWatchRadio () {
    const selectedItem = this.data.list.filter(item => item.type == 'selected')
    const selectedItemLength = selectedItem.length
    const allNUm = selectedItem.reduce((pre, curr) => pre += curr.num, 0)
    const buttonText = allNUm ? `去结算（${ allNUm }）` : '去结算'
    const totalPrice = selectedItem.reduce((pre, curr, index) => {
      const { num, priceRmbStr } = curr
      const ratio = 1000000
      const priceRmb = Number(priceRmbStr) * ratio
      return pre + (priceRmb * num / ratio)
    }, 0)
    const radioStatus = selectedItem.length == this.data.list.length ? 'selected': 'unselected'
    this.setData({ totalPrice, radioStatus, selectedItemLength, buttonText })
  },
  add (e) {
    const { index } = e.detail
    this.operation('add', index)
  },
  sub (e) {
    const { index } = e.detail
    this.operation('sub', index)
  },
  operation (type, index) {
    const { cartId, skuId, spuId, num } = this.data.list[index]
    const skuNum = type == 'add' ? num + 1 : num - 1
    this.selectComponent('#loading').show()
    const params = { uid: this.data.userInfo.uid, delStatus: 0, cartId, spuId, skuNum, skuId, }
    bag.editOrDelCart(params).then(res => {
      if (res.code == 2000) {
        this.setData({ [`list[${ index }].num`]: skuNum }, this.makeBillsAndWatchRadio)
      }
    }).finally(() => {
      this.selectComponent('#loading').hide()
    })
  },

  reselect(e) {
    const { index } = e.detail
    const currItem = this.data.list[index]
    const { cartId, num: skuNum, specsValName1, skuInfoVoList } = currItem
    const range = skuInfoVoList.map(item => Object.assign(item, {name: item.specsValName1, id: item.skuId, cartId, skuNum, index}))
    const pickerSelectedNum = range.findIndex(item => item.name == specsValName1)
    const sizeInfo = { skuInfoVoList: range, recommendedSkuIndex: [pickerSelectedNum], hasRecommendedSize: 1 }
    this.setData({
      range,
      pickerSelectedNum,
      _index: index,
      sizeInfo
    })
    wx.nextTick(() => {
      this.setData({ display: true })
    })
  },
  handleChange (e) {
    console.log('handleChange', e)
    const { num: pickerSelectedNum } = e.detail
    const { range } = this.data
    if (Number(range[pickerSelectedNum].stockNum) == 0) return
    this.setData({ pickerSelectedNum })
  },
  remove () {
    const { list, _willDelSingIndex, _willDelSingType, invalids } = this.data
    const arr = _willDelSingType == 'list' ? list : invalids
    const [ item ] = arr.splice(_willDelSingIndex, 1)
    this.selectComponent('#loading').show()
    bag.editOrDelCart({
      uid: this.data.userInfo.uid,
      delStatus: 1,
      cartId: item.cartId
    }).then(res => {
      if (res.code == 2000) {
        const arrStr = _willDelSingType == 'list' ? 'list' : 'invalids'
        this.setData({
          [arrStr]: arr
        }, this.makeBillsAndWatchRadio)
      }
    }).finally(() => {
      this.selectComponent('#loading').hide()
    })
  },
  showEvent (e) {
    const { index: _willDelSingIndex, isDead } = e.detail
    // const _willDelSingType = isDead ? 'invalids': 'list'
    const { list, invalids } = this.data
    const currList = isDead ? invalids: list
    const currListName = isDead ? 'invalids': 'list'
    const otherList = isDead ? list: invalids
    const otherListName = isDead ? 'list': 'invalids'
    this.closeOtherCell(otherList, otherListName)
    const currItem = currList[_willDelSingIndex]
    currItem.show = true
    currList[_willDelSingIndex].show = true
    // 先把当前状态给变更掉
    this.setData({
      [`${currListName}[${_willDelSingIndex}]`]: currItem
    })
    const itemIndex = currList.findIndex((item, index) => item.show == true && index != _willDelSingIndex)
    if (itemIndex != -1) {
      const item = currList[itemIndex]
      item.show = false
      this.setData({
        [`${currListName}[${itemIndex}]`]: item
      })
    }

  },
  closeOtherCell (arr, name) {
    const itemIndex = arr.findIndex(item => item.show == true)
    if (itemIndex != -1) {
      const item = arr[itemIndex]
      item.show = false
      this.setData({
        [`${name}[${itemIndex}]`]: item
      })
    }
  },
  slideButtonTap (e) {
    const { index: _willDelSingIndex, isDead } = e.detail
    const _willDelSingType = isDead ? 'invalids': 'list'
    this.setData({ _willDelSingIndex, _willDelSingType })
    this.openRemoveSingDialog()
  },
  handleSizeChangeTmp (e) {
    // console.log('handleSizeChangeTmp', e)
    const [ pickerSelectedNum ] = e.detail
    const { range } = this.data
    if (Number(range[pickerSelectedNum].stockNum) == 0) return
    this.setData({ pickerSelectedNum })
  },

  async okHandle () {
    const { pickerSelectedNum,_index, list, range } = this.data
    const oldItem = list[_index]
    const newItem = range[pickerSelectedNum]
    const sameItemIndex = list.findIndex(item => item.spuId == newItem.spuId && item.skuId == newItem.skuId)
    const combined = Object.assign({}, oldItem, newItem)
    list[_index] = combined
    const { uid } = this.data.userInfo
    const res = await bag.editOrDelCart({
      delStatus: 0,
      uid,
      ...combined
    })
    if (res.code == 2000) {
      // 删除相同的那个sku
      if (sameItemIndex != -1 && sameItemIndex != _index) {
        list.splice(sameItemIndex, 1)
      }
      this.setData({ list }, this.makeBillsAndWatchRadio)
    }
    this.setData({ display: false })
  },
})