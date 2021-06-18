import { HTTP } from "../utils/new_http.js";

class Logistics extends HTTP {

  get_detail(data) {
    return this.request({
      url: "/mini/logistic/get_detail",
      data
    });
  }
}

export default new Logistics();