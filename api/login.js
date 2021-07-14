import { HTTP } from '../utils/new_http.js';

class Login extends HTTP {
  // 获取商品列表
  update_user_info(data) {
    return this.request({
      url: '/user/updateAvatar',
      data,
    });
  }
  wechat_register(data) {
    return this.request({
      url: '/register/weixin/minappLogin',
      data,
    });
  }
}

export default new Login();
