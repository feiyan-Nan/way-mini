/**
 * Object.values
 */
if (!Object.values) {
  Object.values = function (obj) {
    if (obj !== Object(obj)) {
      throw new TypeError("Object.values called on a non-object");
    }

    const val = [];
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        val.push(obj[key]);
      }
    }
    return val;
  };
}

/**
 * Promise.prototype.finally
 */
Promise.prototype["finally"] =
  Promise.prototype["finally"] ||
  function finallyPolyfill(callback) {
    var constructor = this.constructor;

    return this.then(
      function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      },
      function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      }
    );
  };

/**
 * String.prototype.trim
 */
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  };
}
