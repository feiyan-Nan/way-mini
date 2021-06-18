import { HTTP } from "../utils/new_http.js";

class Fabs extends HTTP {
  // 获取banner列表
  like(data) {
    return this.request({
      url: "/mini/cont/add_user_like_cont",
      data
    });
  }
  cancel_like(data) {
    return this.request({
      url: "/mini/cont/cancel_user_like_cont",
      data
    })
  }
  readUpData (data) {
    return this.request({
      url: '/mini/cont/add_user_read_cnt',
      data
    })
  }
}

export default new Fabs();