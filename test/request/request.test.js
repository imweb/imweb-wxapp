import 'miniprogram-simulate';
import request from '../../src/request/request';

describe('request/request', () => {
  const defaultOptsUrl = 'https//test.com/api';
  const defaultOptsMethod = 'GET';
  const defaultOptsData = {
    a: 1,
  };
  const defaultOptsHeader = {
    Cookie: 'a=1',
  };
  const defaultOpts = {
    url: defaultOptsUrl,
    method: defaultOptsMethod,
    data: defaultOptsData,
    header: defaultOptsHeader,
  };
  let wxRequest;
  let wxGetNetworkType;

  beforeEach(() => {
    jest.useFakeTimers();
    // 每个用例先把原来的实现保留
    wxRequest = wx.request;
    wxGetNetworkType = wx.getNetworkType;
  });

  afterEach(() => {
    jest.useRealTimers();
    // 每个用例结束再恢复系统实现
    wx.request = wxRequest;
    wx.getNetworkType = wxGetNetworkType;
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

  test('get REQUEST_ERROR_TIMEOUT:1000 when request timeout', () => {
    wx.request = () => {
      return {
        abort() {},
      };
    };

    const mockResolve = jest.fn();
    const ret = request({ ...defaultOpts, timeout: 1000 }).then(mockResolve, (err) => {
      expect(mockResolve.mock.calls.length).toBe(0);
      expect(err instanceof Error).toBeTruthy();
      expect(err.toString()).toBe('Error: REQUEST_ERROR_TIMEOUT:1000');
    });

    jest.runAllTimers();

    return ret;
  });

  test('will abort task when request timeout', (done) => {
    wx.request = () => {
      return {
        abort() {
          done();
        },
      };
    };

    request({ ...defaultOpts, timeout: 1000 }).catch(() => {});
    jest.runAllTimers();
  });

  test('will not setup timer when no timeout params', () => {
    wx.request = () => {};

    request(defaultOpts);

    expect(setTimeout).toHaveBeenCalledTimes(0);
  });

  test('will not setup timer when timeout params is 0', () => {
    wx.request = () => {};

    request({ ...defaultOpts, timeout: 0 });

    expect(setTimeout).toHaveBeenCalledTimes(0);
  });

  test('will clear timer when request return', () => {
    const mockAbort = jest.fn();

    wx.request = (opts) => {
      opts.success({
        statusCode: '200',
      });
      opts.complete();

      return {
        abort: mockAbort,
      };
    };

    const ret = request({ ...defaultOpts, timeout: 1000 }).then(() => {
      jest.runAllTimers();
      expect(mockAbort.mock.calls.length).toBe(0);
    });

    return ret;
  });

  test('get REQUEST_ERROR_NETWORK:[networkType] when request fail', () => {
    const mockResolve = jest.fn();

    wx.getNetworkType = (opts) => {
      opts.success({ networkType: 'wifi' });
    };
    wx.request = (opts) => {
      opts.fail();
    };

    return request(defaultOpts).then(mockResolve, (err) => {
      expect(mockResolve.mock.calls.length).toBe(0);
      expect(err instanceof Error).toBeTruthy();
      expect(err.toString()).toBe('Error: REQUEST_ERROR_NETWORK:wifi');
    });
  });

  test('get REQUEST_ERROR_NETWORK:unknown when request fail and wx.getNetworkType fail', () => {
    const mockResolve = jest.fn();

    wx.getNetworkType = (opts) => {
      opts.fail();
    };
    wx.request = (opts) => {
      opts.fail();
    };

    return request(defaultOpts).then(mockResolve, (err) => {
      expect(mockResolve.mock.calls.length).toBe(0);
      expect(err instanceof Error).toBeTruthy();
      expect(err.toString()).toBe('Error: REQUEST_ERROR_NETWORK:unknown');
    });
  });

  test('get REQUEST_ERROR_SERVER:[statusCode] when request success but http status code is not 2xx', () => {
    const mockResolve = jest.fn();
    const testStatusCode = 404;

    wx.request = (opts) => {
      opts.success({
        statusCode: testStatusCode,
      });
    };

    return request(defaultOpts).then(mockResolve, (err) => {
      expect(mockResolve.mock.calls.length).toBe(0);
      expect(err instanceof Error).toBeTruthy();
      expect(err.toString()).toBe(`Error: REQUEST_ERROR_SERVER:${testStatusCode}`);
    });
  });

  test('get right result when request success', () => {
    const testRes = {
      statusCode: 200,
      data: 'hello world!',
    };

    wx.request = (opts) => {
      opts.success(testRes);
    };

    return request(defaultOpts).then((res) => {
      expect(res).toEqual(testRes);
    });
  });
});
