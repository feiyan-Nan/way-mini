Page({
  data: {
    sticky: [
      {
        text: '使用规则',
      },
      {
        text: '获取规则',
      },
      {
        text: '扣减规则',
      }
    ],
    rules: [
      [
        {
          title: '1.积分的作用？',
          content: ['积分可用于Fabrique App内购买抵扣相应金额。更多场景，敬请期待。']
        },
        {
          title: '2.如何使用积分？',
          content: ['每10积分抵扣1元人民币，订单结算时，可选择使用积分抵扣相应金额，支持全额积分抵扣，不设积分使用上限。']
        },
        {
          title: '3.积分的消耗？',
          content: ['按照积分入账的先后顺序，优先消耗先入账积分。']
        },
        {
          title: '4.如何查看积分？',
          content: ['用户通过“个人中心”查看积分现状以及历史记录。']
        }
      ],
      [
        {
          title: '1，如何获取积分？',
          content: [
            '在Fabrique App、Fabrique精品店小程序，成功的订单金额可累积积分。',
            '发布优质内容入选Fabs推荐，获得相应积分。',
            '首次完善尺码信息，获得相应积分。',
            '其他活动方式获取积分。'
          ]
        },
        {
          title: '2，获取积分规则？',
          content: [
            '实际支付人民币2元即可获得1积分，不足1积分金额将四舍五入计算，特殊活动除外。',
            '例：订单实际支付人民币1,000元，该比订单产生500积分。'
          ]
        },
        {
          title: '3，积分何时到账？',
          content: [
            '交易产生积分将在订单完成后24小时内计入个人账户。',
            '入选Fabs、首次完善尺码信息，积分将在完成后24小时内计入个人账户。'
          ]
        },
        {
          title: '4，积分是否过期？',
          content: [
            '积分具有时效性，积分自获取之日起，至第24个月，逾期积分失效，依次类推。若未在积分有效期内未使用积分，视同放弃。',
            '例：2020年10月15日获得500积分，2022年10月16日零点500积分过期时效。'
          ]
        }
      ],
      [
        {
          title: '1，如发生退货，积分是否退回？',
          content: [
            '如订单退货，则退货单品入库后，对应单品金额返回原账户同时扣减相应积分。',
            '若积分已经使用，在退款金额中按照积分抵现比例计算后，扣除积分等值人民币金额。',
            '若积分在订单抵扣前为临期状态，发生退货时积分已到期，则不予返还抵扣积分部分；同时该笔订单产生的积分将被扣除，账户中积分不足扣除，则在退款金额中扣除积分等值人民币金额。'
          ],
          accentColor: 2
        },
        {
          title: '2，经核实后，恶意订单、异常获取的积分，将扣减相应积分。',
        }
      ]
    ],
    activeIndex: 0
  },
  back () {
    wx.navigateBack()
  },
  onReady() {
    this._makeH()
  },
  tapHandle (e) {
    // console.log(e.mark)
    const { index: activeIndex } = e.mark
    this.setData({ activeIndex })
  },
  _makeH () {
    this.createSelectorQuery().select('.navbar').boundingClientRect(rect => {
      const { height: navH } = rect
      const h = { navH }
      console.log('h', h)
      this.setData({ h })
    }).exec()
  }
});