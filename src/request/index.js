/* eslint-disable implicit-arrow-linebreak */
import { getCookieStr, setCookie } from '../cookie';
import fetch from './request';
import compose from './compose';

const middlewares = [];

// 1. cookie 插件
const useCookie = (ctx, next) => {
  if (ctx.req.useCookie) {
    const cookieStr = getCookieStr();
    if (cookieStr) {
      ctx.req.header.Cookie = cookieStr;
    }
  }
  // 回写 set-cookie 头
  return next().then((res) => {
    if (ctx.req.useCookie && ctx.req.enableSetCookie) {
      const setCookieHeader = res.header['set-cookie'] || '';
      // 这里的 , 号分隔很奇怪，已经反馈给微信方
      // 示例 test=,whistle_nohost_env=edu;
      // Expires=Thu, 15 Nov 2018 05:13:12 GMT; Max-Age=259200; Path=/; Domain=.qq.com
      const cookies = setCookieHeader
        .split(/,(?!\s)/)
        .filter((s) => s)
        .map((str) =>
          str.split(/;\s*/).reduce((acc, cur, i) => {
            const [k, v] = cur.split('=');
            if (i === 0) {
              acc.key = k;
              acc.value = v;
            } else {
              acc[k] = v;
            }
            return acc;
          }, {})
        );
      cookies.forEach((cookie) => {
        setCookie(cookie.key, cookie.value);
      });
    }
    return res;
  });
};

// 2. loading 插件
const useLoadingText = (ctx, next) => {
  if (ctx.req.loadingText) {
    wx.showLoading({
      title: ctx.req.loadingText,
    });
  }
  const hide = () => {
    if (ctx.req.loadingText) {
      wx.hideLoading();
    }
  };
  return next()
    .then((res) => {
      hide();
      return res;
    })
    .catch((err) => {
      hide();
      return Promise.reject(err);
    });
};

middlewares.push(useCookie, useLoadingText);

const request = (req) => {
  const defaultOptions = {
    timeout: 3000,
    useCookie: true, // 开启 cookie 插件
    enableSetCookie: false, // 关闭 set-cookie 回写
    loadingText: false, // 关闭 loading 插件
    header: { 'content-type': 'application/x-www-form-urlencoded' },
  };
  const ctx = { req: { ...defaultOptions, ...req }, res: {} };
  if (req.header) {
    ctx.req.header = { ...req.header };
  }
  return compose(middlewares)(ctx, () =>
    fetch(ctx.req).then((res) => {
      ctx.res = res;
      return res;
    })
  );
};

export { request, middlewares };
