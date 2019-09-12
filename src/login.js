import { promisify } from './utils';
import authorize from './authorize';
import { request } from './request/index';
import { setCookieJar, getCookie } from './cookie';

const wxGetUserInfo = promisify(wx.getUserInfo);
const wxLogin = promisify(wx.login);

const wxLoginRequest = async (opt) => {
  const {
    loginCgi,
    appid,
    getCookieFromResult = ({ retcode, result, msg }) => {
      if (retcode === 0) {
        return result;
      }

      return msg || 'LOGIN_ERROR_CGI_ERR';
    },
  } = opt;
  // 2. 获取微信端登录票据，如果这两个 API 调用顺序调转，会出现 326 报错
  const { code } = await wxLogin();
  const userInfoRes = await wxGetUserInfo();
  const { signature, rawData, iv, encryptedData } = userInfoRes;

  delete opt.loginCgi;
  delete opt.appid;
  const requestData = {
    signature,
    rawData,
    iv,
    encryptedData,
    code,
    appid,
    ...opt,
  };

  // 3. 调用登录接口
  return request({
    url: loginCgi,
    data: requestData,
    loadingText: '登录中',
  }).then((res) => {
    let ret;
    try {
      ret = getCookieFromResult(res.data);
    } catch (e) {
      ret = String(e);
    }

    if (typeof ret === 'string') {
      return Promise.reject(new Error(ret));
    }

    // 设置 cookie
    setCookieJar(ret);
    return ret;
  });
};

const sendLoginRequest = (options) => {
  let { appid } = options;
  if (!appid) {
    if (wx.getAccountInfoSync) {
      appid = wx.getAccountInfoSync().miniProgram.appId;
    } else {
      console.warn('login 组件未设置 appid，且基础库不支持 wx.getAccountInfoSync 自动获取');
    }
  }
  options.appid = appid;

  // 1. 清空登录态
  setCookieJar('');
  return wxLoginRequest(options);
};

/**
 * 登录
 * @param {object} options
 * @param {string} options.loginCgi // 登录接口 url，必填
 * @param {string=} options.appid // 小程序的 appid，高版本可以通过 wx.getAccountInfoSync 自动获取
 * @param {string=} options.title // 检查用户信息授权时，指引打开设置弹窗的 title
 * @param {string=} options.content // 检查用户信息授权时，指引打开设置弹窗的 content
 * @param {Function(Object)=} options.getCookieFromResult // 用来从登录接口的返回结果中获取 cookie 数据，如果接口调用失败需要返回错误信息字符串
 * @return {Promise(Object)} 登录接口返回的数据(也就是 cookie 数据)
 */
const login = async (options = {}) => {
  if (!options.loginCgi) {
    return Promise.reject(new Error('LOGIN_ERROR_NEED_LOGINCGI'));
  }

  const { title = '获取用户信息失败', content = '是否打开设置页，允许小程序使用您的用户信息' } = options;
  const hasRight = await authorize({
    scope: 'userInfo',
    title,
    content,
  });
  if (!hasRight) {
    return Promise.reject(new Error('LOGIN_ERROR_DENY'));
  }
  return sendLoginRequest(options);
};

/**
 * 检查是否已登录，通过检查本地是否有cookie
 * @param {string|Function=} check // 如果是 string，则检查是否存在 getCookie(check)，如果是函数，则直接调用并返回结果，两者都不是返回 false
 * @return {Boolean} 是否已登录
 */
const isLogin = (check) => {
  const type = typeof check;
  if (type === 'string') {
    return !!getCookie(check);
  }

  if (type === 'function') {
    return !!check();
  }

  return false;
};

export { login, isLogin };
