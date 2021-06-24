const { getUserInfo, networkAct } = getApp();
const maps = {
  'pages/my/index': '个人中心',
  'pages/goods-detail/index': '商品详情',
};

const data = JSON.stringify([
  {
    key: 'from',
    label: '客户来源',
    value: '小程序',
  },
  {
    type: 'crm_param',
    key: 'from',
    value: 'miniprogram',
  },
]);

module.exports = Behavior({
  data: {
    sessionFrom: 'nickName=小程序用户',
    ysf: {
      config: JSON.stringify({ data }),
    },
  },
  attached: function () {},
  pageLifetimes: {
    show() {
      this.makeSessionFrom();
    },
  },
  methods: {
    makeSessionFrom() {
      const { is: route } = getCurrentPages().pop();
      const title = maps[route];
      const userInfo = getUserInfo();
      if (userInfo) {
        const { avatar, nickName, uid } = userInfo;
        const ysf = {
          title,
          config: JSON.stringify({
            uid,
            data: JSON.stringify([
              {
                key: 'from',
                label: '客户来源',
                value: '小程序',
              },
              {
                key: 'uid',
                label: 'uid',
                value: uid,
              },
              {
                key: 'avatar',
                label: '头像',
                value: avatar,
              },
              {
                key: 'touxiang',
                label: '头像',
                value: avatar,
                href: avatar,
              },
              {
                key: 'nickName',
                label: '昵称',
                value: nickName,
              },
              {
                type: 'crm_param',
                key: 'from',
                value: 'miniprogram',
              },
            ]),
          }),
        };
        const sessionFrom = `nickName=${nickName}|avatarUrl=${avatar}|foreignid=${uid}|referrerTitle=${ysf.title}|ysf.config= ${ysf.config}`;
        // console.log('+++---***///', sessionFrom)
        this.setData({ ysf, sessionFrom });
      } else {
        this.setData({ 'ysf.title': title });
      }
    },

    handleContact(e) {
      console.log(e);
      // 点击卡片时候的回调
      const { path, query } = e.detail;
      wx.navigateTo({
        url: `${path}?${Object.entries(query).join('&').replace(/,/gi, '=')}`,
      });
    },
  },
});
