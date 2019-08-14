/**
 *
 * @param {Object} option 发起请求的配置对象
 * @param {String} option.url 请求 url
 * @param {String} option.method 请求 method
 * @param {Object} option.data 请求 data，无需序列化
 * @param {Object} option.header 请求 header
 * @param {Object} option.timeout 请求超时时间
 */
function request(option) {
  const { url, method, data, header, timeout } = option;
  let client;
  return new Promise((resolve, reject) => {
    let timer;
    if (timeout > 0) {
      timer = setTimeout(() => {
        reject(new Error(`REQUEST_ERROR_TIMEOUT:${timeout}`));
        client.abort();
      }, timeout);
    }
    client = wx.request({
      url,
      data,
      method,
      header,
      success(res) {
        const { statusCode } = res;
        if (statusCode >= 200 && statusCode <= 209) {
          resolve(res);
        } else {
          reject(new Error(`REQUEST_ERROR_SERVER:${statusCode}`));
        }
      },
      fail() {
        wx.getNetworkType({
          success({ networkType }) {
            reject(new Error(`REQUEST_ERROR_NETWORK:${networkType}`));
          },
          fail() {
            reject(new Error('REQUEST_ERROR_NETWORK:unknown'));
          },
        });
      },
      complete() {
        clearTimeout(timer);
      },
    });
  });
}

export default request;
