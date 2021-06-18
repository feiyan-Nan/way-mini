import { HTTP } from '../utils/new_http.js';

class addressServer extends HTTP {
  // 添加地址
  addAddress(data) {
    return this.request({
      url: '/mini/address/add_address',
      data,
    });
  }
  //选择地址字典接口
  getAllArea(data) {
    return this.request({
      url: '/mini/cn/region/all_area',
      data,
    });
  }
  //收货地址列表
  getListAddress(data) {
    return this.request({
      url: '/mini/address/list_address',
      data,
    });
  }
  //删除收货地址
  removeAddress(data) {
    return this.request({
      url: '/mini/address/remove_address',
      data,
    });
  }
  //编辑收获地址
  editAddress(data) {
    return this.request({
      url: '/mini/address/edit_address',
      data,
    });
  }
  // 地址匹配
  find_wechat_area (data) {
    return this.request({
      url: '/mini/cn/region/find_wechat_area',
      data
    })
  }
}

export default new addressServer();
