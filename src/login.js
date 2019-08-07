import { promisify } from './utils';
import authorize from './authorize';
import { request, setCookieJar, getCookie } from '../request/index';
// QQ轻应用登录
import { MiniCo } from './miniCo/index';

const wxGetUserInfo = promisify(wx.getUserInfo);
const wxLogin = promisify(wx.login);

let MINICO = null;
const wxLoginRequest = async (opt) => {
  const { loginCgi, appid, buzid, scene } = opt;
  // 2. 获取微信端登录票据，如果这两个 API 调用顺序调转，会出现 326 报错
  const { code } = await wxLogin();
  const userInfoRes = await wxGetUserInfo();
  const { signature, rawData, iv, encryptedData } = userInfoRes;
  const requestData = {
    signature,
    rawData,
    iv,
    encryptedData,
    code,
    appid,
    buzid,
  };

  // pc扫码actid
  if (scene) {
    Object.assign(requestData, {
      actid: scene,
    });
  }

  // 3. 调用登录接口
  return request({
    url: loginCgi,
    data: requestData,
    loadingText: '登录中',
  }).then((res) => {
    const { retcode, result, msg } = res.data;
    if (retcode === 0) {
      setCookieJar(result);
      return result;
    }
    const errMsg = msg || 'LOGIN_ERROR_RETCODE';
    return Promise.reject(new Error(`${errMsg}:${retcode}`));
  });
};

const sendLoginRequest = async ({
  loginCgi = 'https://ke.qq.com/cgi-bin/uidaccount/wx_smallapp_login_auth',
  appid = '',
  buzid = 0,
  scene = null,
  // loginType = 0, // 0：微信，1：QQ轻应用
}) => {
  if (!appid) {
    if (wx.getAccountInfoSync) {
      appid = wx.getAccountInfoSync().miniProgram.appId;
    } else {
      console.warn('login 组件未设置 appid，且基础库不支持 wx.getAccountInfoSync 自动获取');
    }
  }
  // 1. 清空登录态
  setCookieJar('');
  return wxLoginRequest({
    loginCgi,
    appid,
    buzid,
    scene,
  });
};

const login = async (options = {}) => {
  const hasRight = await authorize({
    scope: 'userInfo',
    title: '获取用户信息失败',
    content: '是否打开设置页，允许小程序使用您的用户信息',
  });
  if (!hasRight) {
    return Promise.reject(new Error('LOGIN_ERROR_DENY'));
  }
  return sendLoginRequest(options);
};

/**
 * loginType: 0：微信，1：QQ轻应用
 */
const isLogin = () => {
  if (!isQQ()) {
    const session = getCookie('openid');
    return !!session;
  }
  const openid = getCookie('openid');
  const token = getCookie('token');
  const isExpire = new Date().getTime() > getCookie('expire');
  return !!openid && !!token && !isExpire;
};

export { login, isLogin };
