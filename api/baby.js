import { HTTP } from "../utils/new_http.js";


class Baby extends HTTP {
    getDetail (data) {
        return this.request({
            url: '/user/lookDetail',
            data,
            method: "GET"
        })
    }
}

export default new Baby()