/**
 * 将小程序接口转换成 promise 形式
 * @param {Object} api 小程序接口
 */
function promisify(api) {
  return (options, ...params) =>
    new Promise((resolve, reject) => { // eslint-disable-line
      api(Object.assign({}, options, { success: resolve, fail: reject }), ...params);
    });
}

// eslint-disable-next-line
export { promisify };
