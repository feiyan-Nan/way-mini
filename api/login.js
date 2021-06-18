import { HTTP } from "../utils/new_http.js"

class Login extends HTTP {
  // 获取商品列表
  wechat_login(data) {
    return this.request({
      url: "/mini/user/login/wechat_login",
      data,
    });
  }
  wechat_register(data) {
    return this.request({
      url: "/mini/user/login/wechat_register",
      data,
    });
  }
}

export default new Login()
