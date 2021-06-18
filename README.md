# fabrique_mini
fabrique 小程序

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