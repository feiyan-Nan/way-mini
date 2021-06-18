import { HTTP } from "../utils/new_http.js";

class Home extends HTTP {
  // 获取banner列表
  getBannerList() {
    return this.request({
      url: "/mini/goods/list_banner"
    });
  }
  getSpuList(data) {
    return this.request({
      url: "/mini/goods/spu_list",
      data
    })
  }
}

const home = new Home();
export default home;
