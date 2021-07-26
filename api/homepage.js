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
      // url: '/concernPeople/list?type=0&currentPage=1',
      url: '/concernPeople/list',
      data,
      method: 'GET'
    })
  }
}

const homePage = new HomePage();
export default homePage;
