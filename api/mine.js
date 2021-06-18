import { HTTP } from "../utils/new_http.js"

class Mine extends HTTP {
  // 获取商品列表
  get_user_info(data) {
    return this.request({
      url: "/mini/user/get_user_info",
      data,
    })
  }
  get_user_back () {
    return this.request({
      url:'/mini/user/get_user_back'
    })
  }
}
export default new Mine()
