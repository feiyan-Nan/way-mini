import { addressApi } from '../../api/index';

const {
  verifyTel,
  debounce,
  throttle,
  showToast,
  getWechatAddress,
  getPageInformation,
  routingConfig: { confirmOrder, shippingAddress },
  uid,
  globalData: { isX },
  getDetetailAddress,
} = getApp();

const config = {
  consigneeName: '请填写收件人姓名',
  consigneePhone: '请填写收件人手机号',
  region: '请选择所在地区',
  detailAddress: '请填写详细的收件地址',
};
Page({
  data: {
    consigneeName: '',
    detailAddress: '',
    consigneePhone: '',
    region: [],
    regionValue: '',
    status: 'add', // add or edit
    area: {},
    provinceId: '',
    cityId: '',
    countyId: '',
    isClearConsigneeName: false,
    isClearConsigneePhone: false,
    isClearDetailAddress: false,
    showDialog: false,
    addressId: '',
    multiArray: [],
    multiIndex: [0, 0, 0],
    topay: false,
    title: '',
    isX: isX,
    inputMarBot: false,
    height: 0,
    areaIsLoaded: false
  },
  onLoad: async function ({ status, topay }) {
    status &&
      this.setData({
        status,
        topay: topay ? true : false,
      });


    /**
     * TODO
     */


    addressApi.getAllArea().then(res => {
      this.setData({ areaIsLoaded: true })
      if (res.code != 2000) {
        return
      }
      const { provinceList, cityMapList, countyMapList } = res.data;
      // 所有的省份
      const provinceArr = provinceList.map(({ regionName }) => regionName);
      // 北京的区 regionId: 110100,
      const county = countyMapList.filter(({ cityid }) => cityid === 110100)[0].countylist;
      this.setData(
        {
          area: res.data,
          cityMapList,
          countyMapList,
          provinceList,
          provinceArr, //所有的省中文
          multiArray: [provinceArr, ['北京市'], county.map(({ regionName }) => regionName)],
        },
        () => {
          const eventChannel = this.getOpenerEventChannel();
          eventChannel.on('editAddress', ({ data }) => {
            console.log('data/////', data);
            const { provinceName, provinceId, cityName, cityId, countyName } = data;

            const provinceIndex = provinceArr.findIndex((item) => item === provinceName);
            let citylist = [],
              countylist = [],
              ccountyIndex = 0,
              cityIndex = 0;

            if (cityName) {
              citylist = cityMapList
                .find(({ provinceid }) => provinceid === provinceId)
                .citylist.map(({ regionName }) => regionName);
              cityIndex = citylist.findIndex((item) => item === cityName);
              countylist = countyMapList
                .find(({ cityid }) => cityid === cityId)
                .countylist.map(({ regionName }) => regionName);
              ccountyIndex = countylist.findIndex((item) => item === countyName);
            }
            console.log(citylist);
            this.setData({
              ...data,
              multiIndex: [provinceIndex, cityIndex, ccountyIndex],
              // region: [data.provinceName, data.cityName.trim(), data.countyName],
              multiArray: [provinceArr, citylist, countylist],
              regionValue: getDetetailAddress(data),
            });
          });
        }
      );
    })
  },
  scroll (e) {
    const titleName = this.data.status === 'add' ? '添加地址' : '编辑地址';
    const title = e.detail.scrollTop >= 30 ? titleName : '';
    if (title == this.data.title) return
    debounce(this.setData({ title }))
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    const [index1, index2, index3] = e.detail.value;
    const { multiArray } = this.data;
    let regionValue = multiArray[0][index1];

    if (multiArray[1].length > 0) {
      regionValue += multiArray[1][index2];
    }
    if (multiArray[2].length > 0) {
      regionValue += multiArray[2][index3];
    }

    this.setData({
      multiIndex: e.detail.value,
      regionValue,
      ...this.areaNameMapId([multiArray[0][index1], multiArray[1][index2], multiArray[2][index3]]),
    });
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    const { value } = e.detail;
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        const provinceId = this.data.provinceList.find(
          ({ regionName }) => regionName === this.data.provinceArr[value]
        ).regionId;
        data.multiArray[1] = this.data.cityMapList
          .find(({ provinceid }) => provinceid === provinceId)
          .citylist.map(({ regionName }) => regionName);
        console.log(data.multiArray[1], 123);
        if (data.multiArray[1].length === 0) {
          data.multiArray[2] = [];
        } else {
          const firstCityId = this.data.cityMapList.find(
            ({ provinceid }) => provinceid === provinceId
          ).citylist[0].regionId;
          data.multiArray[2] = this.data.countyMapList
            .find(({ cityid }) => cityid === firstCityId)
            .countylist.map(({ regionName }) => regionName);
        }
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        break;
      case 1:
        const provinceName = this.data.provinceArr[this.data.multiIndex[0]];
        const provinceID = this.data.provinceList.find(
          ({ regionName }) => regionName === provinceName
        ).regionId;
        const curCityList = this.data.cityMapList.find(
          ({ provinceid }) => provinceid === provinceID
        ).citylist;
        const cityName = curCityList.map(({ regionName }) => regionName)[value];
        const cityId = curCityList.find(({ regionName }) => regionName === cityName).regionId;
        data.multiArray[2] = this.data.countyMapList
          .find(({ cityid }) => cityid === cityId)
          .countylist.map(({ regionName }) => regionName);
        console.log(data.multiArray[2]);
        data.multiIndex[2] = 0;
        console.log(data.multiIndex);
        break;
    }
    this.setData(data);
  },
  clearContent({
    currentTarget: {
      dataset: { field },
    },
  }) {
    this.setData({
      [field]: '',
    });
  },
  // 处理输入时
  bindinput({ detail: { value }, currentTarget: { dataset: { label }, }, }) {
    this.setData({ [label]: Boolean(value) });

    console.log('value', value.replace(/[^\d]/g, ''))

    // return value.replace(/[^\d]/g, '')

    return value.trim().replace(/[\r\n]/g, '').replace(
        /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi,
        ''
      );
  },
  bindfocus({
    detail: { value, height },
    currentTarget: {
      dataset: { label, mark },
    },
  }) {
    console.log('height-----', height)
    if (value) {
      this.setData({
        [label]: true,
      });
    }
    console.log('mark---', mark)
    if (mark == "textarea") {
      this.setData({ height: height/2 })
    }
  },
  bindblur({
    detail: { value },
    currentTarget: {
      dataset: { label, mark },
    },
  }) {
    this.setData({
      [label]: false
    });
    if (mark == 'textarea') {
      this.setData({ height: 0 })
    }
  },
  submit: throttle(function (e) {
    this.submitData(e);
  }, 2000),
  submitData({ detail: { value } }) {
    console.log('表单携带的数据：-----', value);
    console.log(getPageInformation('confirmOrder'));
    let { consigneePhone } = value;
    consigneePhone = consigneePhone.replace(/[^\d]/g, '')
    value.consigneePhone = consigneePhone
    this.setData({
      consigneePhone
    })

    for (let name in value) {
      console.log('value[name]', value[name])
      console.log('name', name)
      if (!value[name] || value[name].length === 0) {
        showToast({ title: config[name] });
        return false;
      }
    }
    if (consigneePhone.length !== 11) {
      showToast({ title: '请输入11位手机号' });
      return false;
    }

    const { provinceId, cityId, countyId, status, addressId } = this.data;

    console.log('countyId-------', countyId)
    console.log('provinceId, cityId, countyId, status, addressId', provinceId, cityId, countyId, status, addressId)
    if (!countyId && status === 'add') {
      const reg = /香港|澳门|台湾/ig
      if (!reg.test(value.region)) {
        console.log(88888888888888888)
        showToast(config.region)
        return false
      }
    }
    status === 'add' &&
      addressApi.addAddress({ ...value, provinceId, cityId, countyId, uid: uid() }).then((res) => {
        showToast({ title: '添加成功' });
        // 调用确认订单的方法
        getPageInformation(confirmOrder) &&
          getPageInformation(confirmOrder).getOrderDetail(this.data.topay).then(wx.navigateBack);
        getPageInformation(shippingAddress) &&
          getPageInformation(shippingAddress).getAddressList().then(wx.navigateBack);
      });
    status === 'edit' &&
      addressApi
        .editAddress({ ...value, provinceId, cityId, countyId, uid: uid(), addressId })
        .then((res) => {
          showToast({ title: '编辑成功' });
          getPageInformation(shippingAddress) &&
            getPageInformation(shippingAddress).getAddressList().then(wx.navigateBack);
        });
  },
  // 设置picker的默认位置
  makeSelect (data) {
    console.log('data--------', data)
    const { province, city, county } = data
    const { regionName: provinceName, regionId: provinceId } = province
    let cityName, cityId, countyName
    if (Object.values(city).length) {
      cityName = city.regionName
      cityId = city.regionId
    }
    if (Object.values(county).length) {
      countyName = county.regionName
    }
    const provinceArr = this.data.provinceList.map(({ regionName }) => regionName);

    const provinceIndex = this.data.provinceArr.findIndex((item) => item === provinceName);
    let citylist = []
    let countylist = []
    let ccountyIndex = 0
    let cityIndex = 0
    citylist = this.data.cityMapList.find(({ provinceid }) => provinceid === provinceId).citylist.map(({ regionName }) => regionName)
    if (cityName) {

      cityIndex = citylist.findIndex((item) => item.trim() == cityName);
      countylist = this.data.countyMapList.find(({ cityid }) => cityid === cityId).countylist.map(({ regionName }) => regionName);
      ccountyIndex = countylist.findIndex((item) => item === countyName);
    } else {
      const item = this.data.cityMapList.find(({ provinceid }) => provinceid === provinceId).citylist
      let regionId
      if (item.length) {
        regionId= item[0].regionId
        countylist = this.data.countyMapList.find(({ cityid }) => cityid === regionId).countylist.map(({ regionName }) => regionName);
      } else {
        countylist = []
      }
    }
    this.setData({
      multiIndex: [provinceIndex, cityIndex, ccountyIndex],
      multiArray: [provinceArr, citylist, countylist],
      // ...(provinceName && cityName && countyName ? this.areaNameMapId([provinceName, cityName, countyName]) : {}),
      ...this.areaNameMapId([provinceName, cityName, countyName])
    })
  },
  getWechatAddress() {
    getWechatAddress().then(async res => {
      const { userName, telNumber, provinceName, cityName, countyName, detailInfo } = res;
      this.selectComponent('#loading').show()
      const result = await addressApi.find_wechat_area({ provinceName, cityName, countyName })
      this.selectComponent('#loading').hide()
      let regionValue = ''
      if (result.code == 2000) {
        const { province, city, county } = result.data
        this.makeSelect(result.data)
        if (Object.values(province).length && Object.values(city).length && Object.values(county).length) {

        } else {
          showToast('部分微信地址未完全获取，请手动添加')
        }
        const { regionName: provinceName, regionId: provinceId } = province
        const { regionName: cityName } = city
        const { regionName: countyName } = county
        // regionValue =  provinceName + cityName + countyName
        regionValue =  `${provinceName ? provinceName : ''}${cityName ? cityName : ''}${countyName ? countyName : ''}`
      }


      this.setData({
        consigneeName: userName,
        detailAddress: detailInfo,
        consigneePhone: telNumber,
        // ...this.areaNameMapId([provinceName, cityName, countyName]),
        // region: [provinceName, cityName, countyName],
        regionValue
      });
    });
  },
  areaNameMapId(value) {
    console.log('value^^^^^^', value);
    const { provinceList, countyMapList, cityMapList } = this.data.area;
    const provinceId = provinceList.find(({ regionName }) => regionName === value[0]).regionId;
    const citylist = cityMapList.find(({ provinceid }) => provinceid === provinceId).citylist;
    let cityId = 0;
    let countyId = 0;
    if (citylist.length !== 0) {
      const cityItem = citylist.find(({ regionName }) => regionName.trim() === (value[1] || '').trim())
      cityId = cityItem ? cityItem.regionId : 0;
      if (cityId != 0) {
        const countryItem = countyMapList
          .find(({ cityid }) => cityid === cityId)
          .countylist.find(({ regionName }) => regionName.trim() === (value[2] || '').trim())
        countyId = countryItem ? countryItem.regionId : 0;
      }
    }
    return { provinceId, cityId, countyId };
  },
  // 删除地址
  deleteAddress() {
    this.setData({
      showDialog: true,
    });
  },
  onDialogTap({ detail }) {
    if (detail) {
      const { addressId } = this.data;
      addressApi.removeAddress({ addressId }).then((res) => {
        showToast({ title: '删除成功' });
        getPageInformation(shippingAddress) &&
          getPageInformation(shippingAddress)
            .getAddressList()
            .then((res) => {
              this.setData({
                showDialog: false,
              });
              wx.navigateBack({
                delta: 1,
              });
            });
      });
    } else {
      this.setData({
        showDialog: false,
      });
    }
  },
  navigateBack() {
    wx.navigateBack({
      delta: 1,
    });
  },

  checkAreaIsLoaded () {
    console.log('调用一次')
    if (!this.data.areaIsLoaded) {
      this.selectComponent('#loading').show()
      setTimeout(this.checkAreaIsLoaded, 1000)
    } else {
      this.selectComponent('#loading').hide()
      showToast('地址库已加载完成，请再次点击')
    }
  }
});
