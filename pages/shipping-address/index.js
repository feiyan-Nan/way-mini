// import { showModal } from "../../utils/util";
import { addressApi } from '../../api/index';
const { throttle } = getApp()

const {
  showToast,
  showModal,
  routingConfig: { addShippingAddress, editShippingAddress, confirmOrder },
  uid,
  debounce,
  getDetetailAddress,
  getPageInformation,
} = getApp();

Page({
  data: {
    addressList: [],
    title: '',
  },
  onLoad: async function (options) {
    // this.getAllAreaAndStore()
    addressApi.getListAddress({ uid: uid() }).then(({ data }) => {
      this.setData({
        addressList: data,
      });
    });
  },
  onPageScroll(e) {
    const title = e.scrollTop >= 30 ? '收货地址' : '';
    debounce(this.setData({ title }));
  },
  async getAddressList() {
    const { data } = await addressApi.getListAddress({ uid: uid() });
    return new Promise((resolve) => {
      this.setData(
        {
          addressList: data,
        },
        resolve
      );
    });
  },

  handleBottomButtonClick: throttle(function(e) {
    if (this.data.addressList.length >= 10) {
      showToast({ title: '最多可添加10个地址' });
      return false;
    }
    wx.navigateTo({
      url: addShippingAddress,
    });
  }, 2000),
  handleEditShippingAddress({
    currentTarget: {
      dataset: { address },
    },
  }) {
    wx.navigateTo({
      url: editShippingAddress,
      success(res) {
        res.eventChannel.emit('editAddress', { data: address });
      },
    });
  },
  selectShippingAddress({
    currentTarget: {
      dataset: { address },
    },
  }) {
    address.shippingAddress = getDetetailAddress(address) + address.detailAddress;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptDataFromShippingAddressPage', address);
    getPageInformation(confirmOrder) && this.navigateBack();
  },
  navigateBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
  getAllAreaAndStore () {
    addressApi.getAllArea().then(res => {
      const { code, data } = res
      if (code == 2000) {
        const _data = JSON.stringify(wx.getStorageSync('allArea'))
        const strData = JSON.stringify(data)
        if (_data != strData) {
          console.log('更新了')
          wx.setStorage({
            key: 'allArea',
            data
          })
        }
      }

    })
  }
});
