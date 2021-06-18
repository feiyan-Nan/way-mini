import { HTTP } from '../utils/new_http.js'

class Bag extends HTTP {
  // 购物车列表
  getCartList(data) {
    return this.request({
      url: '/mini/shop/cart/list',
      data
    })
  }
  // 获取购物车中SKU项数
  getCartListCount (data) {
    return this.request({
      url: '/mini/shop/cart/count',
      data
    })
  }
  // 添加SKU到购物车
  addToCart (data) {
    return this.request({
      url: '/mini/shop/cart/add',
      data
    })
  }
  // 编辑/删除购物车
  editOrDelCart (data) {
    return this.request({
      url: '/mini/shop/cart/edit',
      data
    })
  }
  delAllInvalidSku (data) {
    return this.request({
      url: '/mini/shop/cart/remove_invalid_sku',
      data
    })
  }
}
const bag = new Bag()

export default bag