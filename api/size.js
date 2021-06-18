import { HTTP } from '../utils/new_http.js';

class Size extends HTTP {
  // 创建用户身材信息
  create_user_size (data) {
    return this.request({
      url: '/mini/size/create_user_size',
      data
    })
  }
  // 获取用户身材信息
  get_my_size (data) {
    return this.request({
      url: '/mini/size/get_my_size',
      data
    })
  }

  update_my_size(data) {
    return this.request({
      url: '/mini/size/update_my_size',
      data
    })
  }
  // 根据spu获取用户身材信息
  getSizeBySpu (data) {
    return this.request({
      url: '/mini/size/get_spu_my_size',
      data
    })
  }
  // 根据spu修改用户身材信息
  upDateSizeBySpu (data) {
    return this.request({
      url: '/mini/size/update_spu_my_size',
      data
    })
  }
}

export default new Size()