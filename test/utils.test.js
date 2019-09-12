import 'miniprogram-simulate';
import { promisify } from '../src/utils';

describe('utils', () => {
  describe('promisify', () => {
    let wxLogin;

    beforeEach(() => {
      // 每个用例先把原来的实现保留
      wxLogin = wx.login;
    });

    afterEach(() => {
      // 每个用例结束再恢复系统实现
      wx.login = wxLogin;
    });

    test('origin api will get same params except success and fail', (done) => {
      const params = {
        a: 1,
        b: 2,
        success: () => {},
        fail: () => {},
        complete: () => {},
      };
      wx.login = (opts) => {
        expect(opts).not.toEqual(params);
        expect(opts.a).toBe(params.a);
        expect(opts.b).toBe(params.b);
        expect(opts.success).not.toBe(params.success);
        expect(opts.fail).not.toBe(params.fail);
        expect(opts.complete).toBe(params.complete);
        done();
      };

      promisify(wx.login)(params);
    });

    test('origin api will get same params except the first one from promisify api', (done) => {
      const params = {
        a: 1,
        b: 2,
      };
      const params2 = {
        c: 3,
      };
      const params3 = {
        c: 4,
      };
      wx.login = (opts, opts2, opts3) => {
        expect(opts).not.toEqual(params);
        expect(opts.a).toBe(params.a);
        expect(opts2).toBe(params2);
        expect(opts3).toBe(params3);
        done();
      };

      promisify(wx.login)(params, params2, params3);
    });

    test('resolve with the result from success', () => {
      const ret = {
        a: 1,
        b: 2,
      };
      wx.login = (opts) => {
        opts.success(ret);
      };

      return promisify(wx.login)().then((result) => {
        expect(result).toEqual(ret);
      });
    });

    test('reject with the result from fail', () => {
      const mockResolve = jest.fn();
      const ret = {
        a: 1,
        b: 2,
      };
      wx.login = (opts) => {
        opts.fail(ret);
      };

      return promisify(wx.login)().then(mockResolve, (result) => {
        expect(mockResolve.mock.calls.length).toBe(0);
        expect(result).toEqual(ret);
      });
    });
  });
});
