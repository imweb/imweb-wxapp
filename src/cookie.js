/* eslint-disable no-sync */
const STORAGE_KEY_COOKIE = '__cookie__';
const PLACEHOLDER_SEMI = '###';
const PLACEHOLDER_EQUAL = '%%%';
const REG_PLACEHOLDER_SEMI = new RegExp(PLACEHOLDER_SEMI, 'g');
const REG_PLACEHOLDER_EQUAL = new RegExp(PLACEHOLDER_EQUAL, 'g');

/**
 * 返回 cookie 头字符串
 * @returns {String}
 */
function getCookieStr() {
  return wx.getStorageSync(STORAGE_KEY_COOKIE);
}

/**
 * 返回解析后的 cookie 键值对对象
 * @returns {Object}
 */
function getCookieJar() {
  const cookieStr = getCookieStr() || '';
  return cookieStr
    .split(';')
    .filter((s) => s)
    .reduce((acc, cur) => {
      const [k, v] = cur.split('=');
      acc[k] = (v && v.replace(REG_PLACEHOLDER_SEMI, ';').replace(REG_PLACEHOLDER_EQUAL, '=')) || '';
      return acc;
    }, {});
}

/**
 * 写 cookie 包
 * @param {String|Object} sessionObj 传入的字符串或对象
 */
function setCookieJar(sessionObj) {
  let cookieStr = sessionObj;
  const type = typeof sessionObj;
  if (type === 'object') {
    cookieStr = Object.keys(sessionObj)
      .map((k) => `${k}=${(sessionObj[k] && String(sessionObj[k]).replace(/;/g, PLACEHOLDER_SEMI).replace(/=/g, PLACEHOLDER_EQUAL)) || ''}`)
      .join(';');
  } else if (type !== 'string') {
    throw new Error(`COOKIE_ERROR_SET_NOT_SUPPORTED_TYPE:${type}`);
  }
  wx.setStorageSync(STORAGE_KEY_COOKIE, cookieStr);
}

/**
 * 取 cookie 值
 * @param {String} key cookie 键名
 * @returns {String}
 */
function getCookie(key) {
  const cookieJar = getCookieJar();
  return cookieJar[key] || '';
}

/**
 * 写 cookie 值
 * @param {String} key cookie 键名
 * @param {String} value 值
 */
function setCookie(key, value) {
  const cookieJar = getCookieJar();
  if (key) {
    cookieJar[key] = value || '';
    setCookieJar(cookieJar);
  } else {
    throw new Error('COOKIE_ERROR_SET_NOT_KEY');
  }
}

/**
 * 清除所有 cookie
 */
function clearCookie() {
  wx.setStorageSync(STORAGE_KEY_COOKIE, '');
}

export { getCookie, setCookie, getCookieStr, setCookieJar, getCookieJar, clearCookie };
