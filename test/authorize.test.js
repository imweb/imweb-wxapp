import 'miniprogram-simulate';
import { default as authorize } from '../src/authorize'; // eslint-disable-line

function setWxGetSettingEmpty() {
  wx.getSetting = (opts) => {
    opts.success({
      authSetting: {},
    });
  };
}

function setWxAuthorizeFail() {
  wx.authorize = (opts) => {
    opts.fail();
  };
}

function setWxShowModalComfirm() {
  wx.showModal = (opts) => {
    opts.success({
      confirm: true,
    });
  };
}

describe('authorize', () => {
  const defaultOpts = {
    scope: 'record',
  };
  const userInfoOpts = {
    scope: 'userInfo',
  };
  const testTitleString = 'test modal title';
  const testContentString = 'test modal content';
  let wxGetSetting;
  let wxAuthorize;
  let wxShowModal;
  let wxOpenSetting;

  beforeEach(() => {
    // 每个用例先把原来的实现保留
    wxGetSetting = wx.getSetting;
    wxAuthorize = wx.authorize;
    wxShowModal = wx.showModal;
    wxOpenSetting = wx.openSetting;
  });

  afterEach(() => {
    // 每个用例结束再恢复系统实现
    wx.getSetting = wxGetSetting;
    wx.authorize = wxAuthorize;
    wx.showModal = wxShowModal;
    wx.openSetting = wxOpenSetting;
  });

  test('get false when wx.getSetting fail', () => {
    wx.getSetting = (opts) => {
      opts.fail();
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('get true when user has authorize', () => {
    wx.getSetting = (opts) => {
      opts.success({
        authSetting: {
          'scope.record': true,
        },
      });
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeTruthy();
    });
  });

  test('get false when the scope needs button[open-type] to be authorized', () => {
    setWxGetSettingEmpty();

    return authorize(userInfoOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('wx.authorize will be called with right scope when user has not authorize and not need button[open-type]', (done) => {
    setWxGetSettingEmpty();
    wx.authorize = (opts) => {
      expect(opts.scope).toBe('scope.record');
      done();
    };

    authorize(defaultOpts);
  });

  test('get true when wx.authorize success', () => {
    setWxGetSettingEmpty();
    wx.authorize = (opts) => {
      opts.success();
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeTruthy();
    });
  });

  test('get false when wx.authorize fail and not to show guide', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();

    return authorize({ ...defaultOpts, guideToSetting: false }).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('show the right title and content when need to show guide', (done) => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    wx.showModal = (opts) => {
      expect(opts.title).toBe(testTitleString);
      expect(opts.content).toBe(testContentString);
      done();
    };

    authorize({ ...defaultOpts, title: testTitleString, content: testContentString });
  });

  test('get false when wx.showModal fail', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    wx.showModal = (opts) => {
      opts.fail();
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('get false when user cancel on guide', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    wx.showModal = (opts) => {
      opts.success({
        confirm: false,
      });
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('call wx.openSetting when user comfirm on guide', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    setWxShowModalComfirm();

    const mockCallback = jest.fn();
    wx.openSetting = mockCallback;

    authorize(defaultOpts);
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('get false when wx.openSetting fail', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    setWxShowModalComfirm();
    wx.openSetting = (opts) => {
      opts.fail();
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('get false when user does not authorize in setting page', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    setWxShowModalComfirm();
    wx.openSetting = (opts) => {
      opts.success({
        authSetting: {},
      });
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeFalsy();
    });
  });

  test('get true when user authorizes in setting page', () => {
    setWxGetSettingEmpty();
    setWxAuthorizeFail();
    setWxShowModalComfirm();
    wx.openSetting = (opts) => {
      opts.success({
        authSetting: {
          'scope.record': true,
        },
      });
    };

    return authorize(defaultOpts).then((hasAuthorize) => {
      expect(hasAuthorize).toBeTruthy();
    });
  });
});
