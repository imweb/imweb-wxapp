/* eslint-disable import/first, function-paren-newline */
import 'miniprogram-simulate';

jest.mock('../src/request/index');

import { request } from '../src/request/index';

const code = 'code';
const signature = 'signature';
const rawData = 'rawData';
const iv = 'iv';
const encryptedData = 'encryptedData';

wx.login = (opts) => {
  opts.success({
    code,
  });
};

wx.getUserInfo = (opts) => {
  opts.success({
    signature,
    iv,
    rawData,
    encryptedData,
  });
};

const loginModule = require('../src/login');

const { login, isLogin } = loginModule;

function setAuthorize() {
  wx.getSetting = (opts) => {
    opts.success({
      authSetting: {
        'scope.userInfo': true,
      },
    });
  };
}

describe('login', () => {
  const loginCgi = 'https://www.qq.com';
  const appid = 'appid';
  const retData = {
    retcode: 0,
    result: {
      a: 1,
    },
  };

  function setCodeAndGetUserInfo() {
    wx.login = (opts) => {
      opts.success({
        code,
      });
    };

    wx.getUserInfo = (opts) => {
      opts.success({
        signature,
        iv,
        rawData,
        encryptedData,
      });
    };
  }

  let wxLogin;
  let wxGetUserInfo;
  let wxGetSetting;
  let wxGetAccountInfoSync;

  beforeEach(() => {
    // 每个用例先把原来的实现保留
    wxLogin = wx.login;
    wxGetUserInfo = wx.getUserInfo;
    wxGetSetting = wx.getSetting;
    wxGetAccountInfoSync = wx.getAccountInfoSync;
  });

  afterEach(() => {
    // 每个用例结束再恢复系统实现
    wx.login = wxLogin;
    wx.getUserInfo = wxGetUserInfo;
    wx.getSetting = wxGetSetting;
    wx.getAccountInfoSync = wxGetAccountInfoSync;
  });

  describe('login', () => {
    test('get LOGIN_ERROR_NEED_LOGINCGI when no loginCgi param', () => {
      const mockResolve = jest.fn();

      return login().then(mockResolve, (err) => {
        expect(mockResolve.mock.calls.length).toBe(0);
        expect(err instanceof Error).toBeTruthy();
        expect(err.toString()).toBe('Error: LOGIN_ERROR_NEED_LOGINCGI');
      });
    });

    test('get LOGIN_ERROR_DENY when user not authorize', () => {
      const mockResolve = jest.fn();

      return login({
        loginCgi,
      }).then(mockResolve, (err) => {
        expect(mockResolve.mock.calls.length).toBe(0);
        expect(err instanceof Error).toBeTruthy();
        expect(err.toString()).toBe('Error: LOGIN_ERROR_DENY');
      });
    });

    test('request function will get appid from params', async () => {
      setAuthorize();
      request.mockReturnValue(
        Promise.resolve({
          data: retData,
        })
      );

      await login({
        loginCgi,
        appid,
      });

      expect(request).toHaveBeenCalledWith({
        url: loginCgi,
        data: {
          appid,
          code,
          signature,
          iv,
          rawData,
          encryptedData,
        },
        loadingText: '登录中',
      });
    });
  });
});
