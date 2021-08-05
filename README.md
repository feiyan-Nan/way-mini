# fabrique_mini
我顺路 小程序


1. 2 .  登录接口 .  http://39.105.90.25:4999/web/#/1?page_id=268
3. 用户信息更新接口  http://39.105.90.25:4999/web/#/1?page_id=71
4. 查询用户信息接口 http://39.105.90.25:4999/web/#/1?page_id=54
5. 获取线路的人接口 http://39.105.90.25:4999/web/#/1?page_id=230
6. 线路信息接口，线路用户接口 http://39.105.90.25:4999/web/#/1?page_id=266
7. 喜欢/不喜欢状态更新接口 http://39.105.90.25:4999/web/#/1?page_id=236
8. 用户长坐路线更新接口：http://39.105.90.25:4999/web/#/1?page_id=29 ，
   查询：http://39.105.90.25:4999/web/#/1?page_id=269

## 清除用户信息
GET http://api-test.woshunlu.com/user/delete?uid=98394
token: AmEAqlADAZPDa5Kjpibp5ebE
deviceId: 18d6cce10f64daac
Content-Type: text/htm

@南飞雁 你用这个token，不会过期

### TODO 可以在接口请求的全局配置中添加网络的判断
## 测试uid
```
23376939
93625913
```


```
components
    navbar 自定义导航
    dialog 自定义的 详情：https://www.cnblogs.com/qqcc1388/p/13213686.html
    bottom-button 底部固定的按钮（封装了网络判断和节流）
```


### methods调用方式为 `const { showToast } = getApp();`
```
methods (所有方法都写在util.js)
    util.js
        formatThousands 处理数据千分位  4545.56 ==>  ¥4,545.56
        showToast  封装了微信的wx.showToast（Promise）
        showModal  封装了微信的wx.showModal（Promise）
        verifyTel  正则验证手机号
        formatCountDown  倒计时
        formatTime  格式化时间（时间戳转可视化时间）
    lodash.js
        throttle   函数节流
        debounce   函数防抖
```

> 所有接口的封装都在`api/index`在使用api时`import { Order } from "../../api/index";`倒入对应的模块即可


收货地址： `pages/shipping-address/index`