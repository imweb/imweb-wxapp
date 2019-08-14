import 'miniprogram-simulate';
import { request, middlewares } from '../../src/request/index';
import { setCookieJar, getCookieStr, setCookie, clearCookie } from '../../src/cookie';

function setWxRequestResult(res) {
  wx.request = (opts) => {
    opts.success(res);
    opts.complete();
  };
}

function setWxRequestFail() {
  wx.getNetworkType = (opts) => {
    opts.success({ networkType: 'wifi' });
  };
  wx.request = (opts) => {
    opts.fail();
    opts.complete();
  };
}

describe('request/index', () => {
  describe('middlewares', () => {
    test('has two items', () => {
      expect(middlewares instanceof Array).toBeTruthy();
      expect(middlewares.length).toBe(2);
    });
  });

  describe('request', () => {
    const defaultOptsUrl = 'https//test.com/api';
    const defaultOptsMethod = 'GET';
    const defaultOptsData = {
      a: 1,
    };
    const defaultOptsHeader = {
      TestHeader: 'a=1',
    };
    const defaultOpts = {
      url: defaultOptsUrl,
      method: defaultOptsMethod,
      data: defaultOptsData,
      header: defaultOptsHeader,
    };
    const defaultResult = {
      statusCode: '200',
      data: {
        a: 1,
      },
      header: {
        TestHeader: 'a=1',
      },
    };
    const defaultCookieJar = {
      a: 1,
      b: 2,
    };
    const defaultLoadingText = 'test loadingText';
    let wxRequest;
    let wxGetNetworkType;
    let wxShowLoading;
    let wxHideLoading;

    beforeEach(() => {
      jest.useFakeTimers();
      wx.clearStorage();
      // 每个用例先把原来的实现保留
      wxRequest = wx.request;
      wxGetNetworkType = wx.getNetworkType;
      wxShowLoading = wx.showLoading;
      wxHideLoading = wx.hideLoading;
    });

    afterEach(() => {
      jest.useRealTimers();
      // 每个用例结束再恢复系统实现
      wx.request = wxRequest;
      wx.getNetworkType = wxGetNetworkType;
      wx.showLoading = wxShowLoading;
      wx.hideLoading = wxHideLoading;
    });

    test('wx.request will be called with the params', (done) => {
      wx.request = (opts) => {
        expect(opts.url).toBe(defaultOptsUrl);
        expect(opts.method).toBe(defaultOptsMethod);
        expect(opts.data).toEqual(defaultOptsData);
        expect(opts.header).toEqual(defaultOptsHeader);

        done();
      };

      request(defaultOpts);
    });

    test('wx.request will be called with the default header when no header params', (done) => {
      wx.request = (opts) => {
        expect(opts.url).toBe(defaultOptsUrl);
        expect(opts.method).toBe(defaultOptsMethod);
        expect(opts.data).toEqual(defaultOptsData);
        expect(opts.header).toEqual({
          'content-type': 'application/x-www-form-urlencoded',
        });

        done();
      };

      const opts = { ...defaultOpts };
      delete opts.header;
      request(opts);
    });

    test('get the same result from wx.request', () => {
      setWxRequestResult(defaultResult);

      return request(defaultOpts).then((res) => {
        expect(res).toEqual(defaultResult);
      });
    });

    test('get the right error when wx.request fail', () => {
      const mockResolve = jest.fn();
      setWxRequestFail();

      return request(defaultOpts).then(mockResolve, (err) => {
        expect(mockResolve.mock.calls.length).toBe(0);
        expect(err instanceof Error).toBeTruthy();
        expect(err.toString()).toBe('Error: REQUEST_ERROR_NETWORK:wifi');
      });
    });

    describe('useLoadingText', () => {
      test('will not show loading when there is not "loadingText" param', () => {
        const mockShowLoading = jest.fn();
        const mockHideLoading = jest.fn();
        wx.showLoading = mockShowLoading;
        wx.hideLoading = mockHideLoading;
        setWxRequestResult(defaultResult);

        return request(defaultOpts).then((res) => {
          expect(res).toEqual(defaultResult);
          expect(mockShowLoading.mock.calls.length).toBe(0);
          expect(mockHideLoading.mock.calls.length).toBe(0);
        });
      });

      test('will show loading with "loadingText" param and auto hide', () => {
        const mockHideLoading = jest.fn();
        wx.showLoading = (opts) => {
          expect(opts.title).toBe(defaultLoadingText);
        };
        wx.hideLoading = mockHideLoading;
        setWxRequestResult(defaultResult);

        return request({ ...defaultOpts, loadingText: defaultLoadingText }).then((res) => {
          expect(res).toEqual(defaultResult);
          expect(mockHideLoading.mock.calls.length).toBe(1);
        });
      });

      test('will show loading with "loadingText" param and auto hide when wx.request fail', () => {
        const mockResolve = jest.fn();
        const mockHideLoading = jest.fn();
        wx.showLoading = (opts) => {
          expect(opts.title).toBe(defaultLoadingText);
        };
        wx.hideLoading = mockHideLoading;
        setWxRequestFail();

        return request({ ...defaultOpts, loadingText: defaultLoadingText }).then(mockResolve, () => {
          expect(mockResolve.mock.calls.length).toBe(0);
          expect(mockHideLoading.mock.calls.length).toBe(1);
        });
      });
    });

    describe('useCookie', () => {
      test('send right cookie when request', () => {
        setCookieJar(defaultCookieJar);
        wx.request = (opts) => {
          expect(opts.header).not.toBeUndefined();
          expect(opts.header.Cookie).toBe(getCookieStr());
          opts.success(defaultResult);
          opts.complete();
        };

        return request(defaultOpts).then((res) => {
          expect(res).toEqual(defaultResult);
        });
      });

      test('not send cookie when set useCookie param false', () => {
        setCookieJar(defaultCookieJar);
        wx.request = (opts) => {
          expect(opts.header).not.toBeUndefined();
          expect(opts.header.Cookie).toBeUndefined();
          opts.success(defaultResult);
          opts.complete();
        };

        return request({ ...defaultOpts, useCookie: false }).then((res) => {
          expect(res).toEqual(defaultResult);
        });
      });

      test('get empty cookie when there is not set-cookie header', () => {
        setWxRequestResult(defaultResult);

        return request({ ...defaultOpts, enableSetCookie: true }).then((res) => {
          expect(getCookieStr()).toBeNull();
          expect(res).toEqual(defaultResult);
        });
      });

      test('get right cookie when there is set-cookie header', () => {
        const cookieItems = ['a', 'b'];
        cookieItems.forEach((key) => {
          setCookie(key, 1);
        });
        const rightCookieStr = getCookieStr();

        // 清空 cookie
        clearCookie();
        expect(getCookieStr()).toBe('');

        setWxRequestResult({
          ...defaultResult,
          header: {
            'set-cookie': cookieItems
              .map((key) => `${key}=1`)
              .join(';Expires=Thu, 15 Nov 2018 05:13:12 GMT; Max-Age=259200; Path=/; Domain=.qq.com,'),
          },
        });

        return request({ ...defaultOpts, enableSetCookie: true }).then(() => {
          expect(getCookieStr()).toBe(rightCookieStr);
        });
      });
    });
  });
});
