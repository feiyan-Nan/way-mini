import { HTTP } from '../utils/new_http.js';

class orderServer extends HTTP {
  // 立即支付
  orderPay(data) {
    return this.request({
      url: '/mini/order/pay_order_by_wechat',
      data,
    });
  }
  // 创建订单
  createOrder(data) {
    return this.request({
      url: '/mini/order/create_order',
      data,
    });
  }
  // 全部订单列表
  getAllOrderList(data) {
    return this.request({
      url: '/mini/order/all_list',
      data,
    });
  }
  // 待支付订单列表
  getWaitForPayList(data) {
    return this.request({
      url: '/mini/order/wait_for_pay_list',
      data,
    });
  }
  //待发货订单列表
  getWaitSendOutGoodsList(data) {
    return this.request({
      url: '/mini/order/wait_send_out_goods_list',
      data,
    });
  }
  //待收货订单列表
  getWaitReceivingList(data) {
    return this.request({
      url: '/mini/order/wait_receiving_goods_list',
      data,
    });
  }
  // 订单数量
  getPayOrderNum(data) {
    return this.request({
      url: '/mini/order/get_pay_order_num',
      data,
    });
  }
  // 订单详情
  getorderDetail(data) {
    return this.request({
      url: '/mini/order/order_detail',
      data,
    });
  }
  // 检查订单状态
  check_status(data) {
    return this.request({
      url: '/mini/order/check_status',
      data,
    });
  }
  find_subscribe_template () {
    return this.request({
      url: '/mini/common/find_subscribe_template'
    })
  }
}

export default new orderServer();
