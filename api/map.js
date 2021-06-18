import { HTTP } from "../utils/new_http.js"


class Maps extends HTTP{
  getList (data) {
    return this.request({
      url: '/mini/goods/classify_list',
      data
    })
  }
  designer_spu_list (data) {
    return this.request({
      url: '/mini/goods/designer_spu_list',
      data
    })
  }
  category_spu_list (data) {
    return this.request({
      url: '/mini/goods/category_spu_list',
      data
    })
  }
}

export default new Maps()