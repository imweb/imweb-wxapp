import 'miniprogram-simulate';
import { getCookie, setCookie, getCookieStr, setCookieJar, getCookieJar, clearCookie } from '../src/cookie';

describe('cookie', () => {
  beforeEach(() => {
    wx.clearStorage();
  });

  describe('getCookieStr', () => {
    test('get null when there is no cookie', () => {
      expect(getCookieStr()).toBeNull();
    });

    test('get string has not ";" when there is only one pair', () => {
      setCookie('a', 1);
      expect(getCookieStr()).toBe('a=1');
    });

    test('get right string when there are two pair', () => {
      setCookie('a', 1);
      setCookie('b', 2);
      expect(getCookieStr()).toBe('a=1;b=2');
      expect(getCookieStr()).not.toBe('b=2;a=1');
    });
  });

  describe('setCookie', () => {
    test('get string 1 when set number 1', () => {
      setCookie('a', 1);
      expect(getCookie('a')).not.toBe(1);
      expect(getCookie('a')).toBe('1');
    });

    test('get "" when set null', () => {
      setCookie('a', 1);
      expect(getCookie('a')).toBe('1');
      setCookie('a', null);
      expect(getCookie('a')).toBe('');
    });

    test('get "" when set undefined', () => {
      setCookie('a', 1);
      expect(getCookie('a')).toBe('1');
      setCookie('a', undefined);
      expect(getCookie('a')).toBe('');
    });

    test('get "[object Object]" when set object', () => {
      setCookie('a', { a: 1 });
      expect(getCookie('a')).toBe('[object Object]');
    });

    test('get "1,2" when set array [1, 2]', () => {
      setCookie('a', [1, 2]);
      expect(getCookie('a')).toBe('1,2');
    });

    test('get right string when set string includes ";" and "="', () => {
      setCookie('a', '3;b=4;c=5');
      expect(getCookie('a')).toBe('3;b=4;c=5');
    });

    test('', () => {
      expect(() => {
        setCookie('', 1);
      }).toThrow('COOKIE_ERROR_SET_NOT_KEY');
    });
  });

  describe('getCookie', () => {
    test('get "" when there is no cookie', () => {
      expect(getCookie('a')).toBe('');
    });

    test('get "" when get ""', () => {
      expect(getCookie('')).toBe('');
    });
  });

  describe('getCookieJar', () => {
    test('get {} when there is no cookie', () => {
      expect(getCookieJar()).toEqual({});
    });

    test('get right object when set many cookie', () => {
      setCookie('a', 1);
      setCookie('b', '3;b=4;c=5');
      expect(getCookieJar()).toEqual({
        a: '1',
        b: '3;b=4;c=5',
      });
    });
  });

  describe('setCookieJar', () => {
    test('throw error when set not string or object', () => {
      expect(() => {
        setCookieJar(() => {});
      }).toThrow('COOKIE_ERROR_SET_NOT_SUPPORTED_TYPE');
    });

    test('right when set string with no key', () => {
      setCookieJar('=1');
      expect(getCookieJar()).toEqual({ '': '1' });
    });

    test('right when set string with no value', () => {
      setCookieJar('a=');
      expect(getCookieJar()).toEqual({ a: '' });
    });

    test('right when set string with just a key', () => {
      setCookieJar('a');
      expect(getCookieJar()).toEqual({ a: '' });
    });

    test('right when set string with semi', () => {
      setCookieJar('a;b=1;c=');
      expect(getCookieJar()).toEqual({ a: '', b: '1', c: '' });
    });

    test('right when set object', () => {
      setCookieJar({});
      expect(getCookieJar()).toEqual({});
    });

    test('right when set complicated object', () => {
      setCookieJar({
        a: null,
        b: undefined,
        c: 1,
        d: [1, 2, 3],
        e: {
          a: 1,
        },
      });
      expect(getCookieJar()).toEqual({
        a: '',
        b: '',
        c: '1',
        d: '1,2,3',
        e: '[object Object]',
      });
    });

    test('setCookieJar will replace all cookie', () => {
      setCookieJar('a;b=1;c=');
      expect(getCookieJar()).toEqual({ a: '', b: '1', c: '' });
      setCookieJar('d');
      expect(getCookieJar()).toEqual({ d: '' });
      setCookieJar({});
      expect(getCookieJar()).toEqual({});
    });
  });

  describe('clearCookie', () => {
    test('get {} when clear cookie', () => {
      setCookie('a', 1);
      expect(getCookie('a')).toBe('1');
      clearCookie();
      expect(getCookieJar()).toEqual({});
    });
  });
});
