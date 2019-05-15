import 'miniprogram-simulate';
import Storage from '../src/Storage';

describe('Storage', () => {
  const namespace1 = 'ns1';
  const namespace2 = 'ns2';
  let s1;
  let s2;

  beforeAll(() => {
    s1 = new Storage(namespace1);
    s2 = new Storage(namespace2);
  });

  beforeEach(() => {
    s1.clear();
    s2.clear();
  });

  describe('set()', () => {
    test('set a simple type value', () => {
      s1.set('test', 1);

      expect(s1.get('test')).toBe(1);
    });

    test('set a complex type value', () => {
      const value = { a: 1, b: { c: 3 } };

      s1.set('test', value);

      expect(s1.get('test')).toEqual(value);
    });

    test('set by using path key with no root value', () => {
      s1.set('test.a', 1);

      expect(s1.get('test')).toEqual({ a: 1 });
    });

    test('set by using path key with root value, the root value will be replaced', () => {
      s1.set('test', 1);
      s1.set('test.a', 1);

      expect(s1.get('test')).toEqual({ a: 1 });
    });

    test('throw error when set no data', () => {
      expect(() => {
        s1.set('test');
      }).toThrow('STORAGE_ERROR_SET_UNDEFINED_DISALLOWED');
    });

    test('throw error when set no key and data', () => {
      expect(() => {
        s1.set();
      }).toThrow('STORAGE_ERROR_SET_UNDEFINED_DISALLOWED');
    });

    test('throw error when set by using array index key', () => {
      expect(() => {
        s1.set('test[1]', 1);
      }).toThrow('STORAGE_ERROR_SET_BRACKET_NOT_SUPPORTED');
    });

    test('throw error when set by using path key which more than two parts', () => {
      expect(() => {
        s1.set('a.b.c', 1);
      }).toThrow('STORAGE_ERROR_SET_MUTIL_DOT_NOT_SUPPORTED');
    });

    test('throw error when wx.setStorageSync calls fail', () => {
      const _setStorageSync = global.wx.setStorageSync;
      global.wx.setStorageSync = function() {
        throw new Error('test');
      };

      expect(() => {
        s1.set('test', 1);
      }).toThrow('STORAGE_ERROR_SET_FAIL:test');

      global.wx.setStorageSync = _setStorageSync;
    });
  });

  describe('get()', () => {
    test('get undefined when not set value before', () => {
      expect(s1.get('test')).toBeUndefined();
    });

    test('get undefined with no key', () => {
      expect(s1.get()).toBeUndefined();
    });
  });

  describe('has()', () => {
    test('got false when there is not value set before', () => {
      expect(s1.has('test')).toBeFalsy();
    });

    test('got true when the key has set before', () => {
      s1.set('test', 1);
      expect(s1.has('test')).toBeTruthy();
    });

    test('not throw error with no key, it will return false', () => {
      expect(() => {
        s1.has();
      }).not.toThrow();
      expect(s1.has()).toBeFalsy();
    });
  });

  describe('remove()', () => {
    test('remove the value of the key', () => {
      s1.set('test', 1);
      expect(s1.get('test')).toBe(1);

      s1.remove('test');
      expect(s1.get('test')).toBeUndefined();
    });

    test('not throw error with no key', () => {
      expect(() => {
        s1.remove();
      }).not.toThrow();
    });
  });

  describe('clear()', () => {
    test('clear all values', () => {
      s1.set('test1', 1);
      s1.set('test2', 2);
      expect(s1.get('test1')).toBe(1);
      expect(s1.get('test2')).toBe(2);

      s1.clear();
      expect(s1.get('test1')).toBeUndefined();
      expect(s1.get('test2')).toBeUndefined();
    });
  });
});
