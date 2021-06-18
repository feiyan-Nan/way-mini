import { HTTP } from "../utils/new_http.js";

class SpuDetail extends HTTP {
  // 获取banner列表
  getSpuDetail(data) {
    return this.request({
      url: "/mini/goods/spu_detail_v1",
      data
    });
  }
  getSizeInfo (data) {
    return this.request({
      url: '/mini/goods/sku_size_info',
      data
    })
  }
  getFabs (data) {
    return this.request({
      url: '/mini/cont/spu_fabs',
      data
    })
  }
}

export default new SpuDetail();
