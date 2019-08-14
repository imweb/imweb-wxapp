import 'miniprogram-simulate';
import compose from '../../src/request/compose';

describe('request/compose', () => {
  test('get "Middleware stack must be an array!" when middleware is not an array', () => {
    expect(() => {
      compose(1);
    }).toThrow('Middleware stack must be an array!');

    expect(() => {
      compose('a');
    }).toThrow('Middleware stack must be an array!');

    expect(() => {
      compose(() => {});
    }).toThrow('Middleware stack must be an array!');

    expect(() => {
      compose(null);
    }).toThrow('Middleware stack must be an array!');

    expect(() => {
      compose();
    }).toThrow('Middleware stack must be an array!');
  });

  test('get "Middleware must be composed of functions!" when middleware arry items are not function', () => {
    expect(() => {
      compose([1]);
    }).toThrow('Middleware must be composed of functions!');

    expect(() => {
      compose(['a']);
    }).toThrow('Middleware must be composed of functions!');

    expect(() => {
      compose([() => {}, 1]);
    }).toThrow('Middleware must be composed of functions!');

    expect(() => {
      compose([null]);
    }).toThrow('Middleware must be composed of functions!');
  });

  test('get function from compose', () => {
    const ret = compose([]);

    expect(typeof ret === 'function').toBeTruthy();
  });

  test('all function will get the same contect from first argument', () => {
    const ctx = {
      a: 1,
    };
    let funcOneHasBeenCalled = false;
    let funcTwoHasBeenCalled = false;
    const middleware = [
      (context, next) => {
        funcOneHasBeenCalled = true;
        expect(context).toEqual(ctx);
        return next();
      },
      (context, next) => {
        funcTwoHasBeenCalled = true;
        expect(context).toEqual(ctx);
        return next();
      },
    ];

    return compose(middleware)(ctx, () => {
      expect(funcOneHasBeenCalled).toBeTruthy();
      expect(funcTwoHasBeenCalled).toBeTruthy();
      return 1;
    });
  });

  test('all function will be called in order', () => {
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next();
      },
      (context, next) => {
        expect(count++).toBe(1);
        return next();
      },
    ];

    return compose(middleware)(null, () => {
      expect(count++).toBe(2);
      return 1;
    });
  });

  test('when a middleware does not call next, the functions after it will not be called', () => {
    const mockCallback = jest.fn();
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next();
      },
      () => {
        expect(count++).toBe(1);
      },
    ];

    return compose(middleware)(null, mockCallback).then(() => {
      expect(mockCallback.mock.calls.length).toBe(0);
    });
  });

  test('reject with "next() called multiple times" when a middleware call next more than one time', () => {
    const mockResolve = jest.fn();
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        next();
        return next();
      },
      (context, next) => {
        expect(count++).toBe(1);
        return next();
      },
    ];

    return compose(middleware)(null, () => {
      expect(count++).toBe(2);
      return 1;
    }).then(mockResolve, (err) => {
      expect(mockResolve.mock.calls.length).toBe(0);
      expect(err instanceof Error).toBeTruthy();
      expect(err.toString()).toBe('Error: next() called multiple times');
    });
  });

  test('all functions will get result from the one after it, compose promise will resolve with the result of the first middleware', () => {
    let count = 0;
    let nextCount = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next().then((ret) => {
          expect(nextCount++).toBe(1);
          expect(ret).toBe(2);
          return 3;
        });
      },
      (context, next) => {
        expect(count++).toBe(1);
        return next().then((ret) => {
          expect(nextCount++).toBe(0);
          expect(ret).toBe(1);
          return 2;
        });
      },
    ];

    return compose(middleware)(null, () => {
      expect(count++).toBe(2);
      return 1;
    }).then((ret) => {
      expect(nextCount++).toBe(2);
      expect(ret).toBe(3);
    });
  });

  test('all middleware promise results are depended on the function after it', () => {
    const mockResolve = jest.fn();
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next().then(mockResolve, (err) => {
          expect(mockResolve.mock.calls.length).toBe(0);
          expect(err instanceof Error).toBeTruthy();
          expect(err.toString()).toBe('Error: next() called multiple times');
          return 3;
        });
      },
      (context, next) => {
        expect(count++).toBe(1);
        next();
        return next();
      },
    ];

    return compose(middleware)(null, () => {
      expect(count++).toBe(2);
      return 1;
    }).then((ret) => {
      expect(ret).toBe(3);
    });
  });

  test('resolve undefined when compose has not callback', () => {
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next().then(() => {
          return 1;
        });
      },
      (context, next) => {
        expect(count++).toBe(1);
        return next().then((ret) => {
          expect(ret).toBeUndefined();
        });
      },
    ];

    return compose(middleware)(null).then((ret) => {
      expect(ret).toBe(1);
    });
  });

  test('resolve undefined when compose callback call next()', () => {
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next().then((ret) => {
          expect(ret).toBeUndefined();
          return 1;
        });
      },
      (context, next) => {
        expect(count++).toBe(1);
        return next().then((ret) => {
          expect(ret).toBeUndefined();
        });
      },
    ];

    return compose(middleware)(null, (context, next) => {
      return next();
    }).then((ret) => {
      expect(ret).toBe(1);
    });
  });

  test('resolve undefined when compose has not callback', () => {
    const mockResolve = jest.fn();
    let count = 0;
    const middleware = [
      (context, next) => {
        expect(count++).toBe(0);
        return next().then((ret) => {
          expect(ret).toBeUndefined();
          return 1;
        });
      },
      (context, next) => {
        expect(count++).toBe(1);
        return next().then(mockResolve, (err) => {
          expect(mockResolve.mock.calls.length).toBe(0);
          expect(err instanceof Error).toBeTruthy();
          expect(err.toString()).toBe('Error: test');
        });
      },
    ];

    return compose(middleware)(null, () => {
      throw new Error('test');
    }).then((ret) => {
      expect(ret).toBe(1);
    });
  });
});
