import { HTTP } from '../utils/new_http.js';

class HomePage extends HTTP {
  // 地图上线路的人
  getNearList(data) {
    return this.request({
      url: '/way/nearLine/users',
      data,
    });
  }
  getSpuList(data) {
    return this.request({
      url: '/mini/goods/spu_list',
      data,
    });
  }

  getLoveMe (data) {
    return this.request({
      url: '/concernPeople/list',
      data,
      method: 'GET'
    })
  }

  getLineDetail (data) {
    return this.request({
      url: '/way/aroundInfo/profile',
      data,
      method: 'GET'
    })
  }

  /*
    左划右划 线路上的人不喜欢打招呼接口
  */
 slip(data) {
   return this.request({
     url: '/way/slipUsers',
     method: 'GET',
     data
   })
 }
}

const homePage = new HomePage();
export default homePage;
