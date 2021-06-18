/**
 * 函数节流
 * @param fn 需要进行节流操作的事件函数
 * @param interval 间隔时间
 * @returns {Function}
 */
function throttle(fn, interval) {
  let enterTime = 0; //触发的时间
  let gapTime = interval || 500; //间隔时间，如果interval不传，则默认500ms
  return function() {
    let context = this;
    let backTime = new Date(); //第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments[0]); //arguments[0]是事件处理函数默认事件参数event call绑定当前page对象
      enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/**
 * 函数防抖
 * @param fn 需要进行防抖操作的事件函数
 * @param interval 间隔时间
 * @returns {Function}
 */
function debounce(fn, interval) {
  let timer;
  let gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
  return function() {
    clearTimeout(timer);
    let context = this;
    let args = arguments[0]; //保存此处的arguments，因为setTimeout是全局的，arguments无法在回调函数中获取，此处为闭包。
    timer = setTimeout(function() {
      fn.call(context, args); //args是事件处理函数默认事件参数event  call绑定当前page对象
    }, gapTime);
  };
}

export default {
  throttle,
  debounce
};
