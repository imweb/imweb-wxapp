const defaultOptions = {
  scope: 'userInfo',
  title: '获取权限失败',
  content: '是否打开设置页，手动开启对应权限',
  guideToSetting: true,
};

const noPopupAuthList = ['userInfo'];

/**
 * 用于判断、请求用户权限及引导用户打开设置页授权
 * @param {object} userOptions
 * @param {string} userOptions.scope // 权限名字
 * @param {string=} userOptions.title // 指引打开设置弹窗的 title
 * @param {string=} userOptions.content // 指引打开设置弹窗的 content
 * @param {boolean=} userOptions.guideToSetting // 当用户没有授权时，是否弹窗指引用户打开设置页
 * @return {Promise(boolean)} 最终授权结果
 */
const authorize = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  const { scope, guideToSetting } = options;

  // Q: 为什么这里不用async/await？
  // A: wx.openSetting放在promise.then中就会调用失败了QAQ坑
  // 流程:
  // 1、判断是否已经授权
  // 2、没有则请求授权
  // 3、请求授权失败（拒绝过）则showmodal指引打开setting
  // 4、modal被confirm后openSetting
  // 5、打开setting后再判断是否已授权
  // 6、resolve(授权结果);
  return new Promise((resolve) => {
    wx.getSetting({
      // 1
      success(res) {
        if (!res.authSetting[`scope.${scope}`]) {
          // 2
          // 排除必须要opentype button的权限
          if (noPopupAuthList.indexOf(scope) > -1) {
            resolve(false);
            return;
          }

          wx.authorize({
            scope: `scope.${scope}`,
            success() {
              resolve(true);
            },
            fail() {
              // 3
              if (guideToSetting) {
                const { title, content } = options;
                wx.showModal({
                  title,
                  content,
                  success({ confirm }) {
                    if (confirm) {
                      // 4
                      wx.openSetting({
                        success(sRes) {
                          if (sRes.authSetting[`scope.${scope}`]) {
                            // 5
                            // 权限生效属于异步操作，留点 timeout
                            setTimeout(() => {
                              resolve(true);
                            }, 100);
                          } else {
                            resolve(false);
                          }
                        },
                        fail() {
                          resolve(false);
                        },
                      });
                    } else {
                      resolve(false);
                    }
                  },
                  fail() {
                    // 安卓下某些版本modal取消归为fail
                    resolve(false);
                  },
                });
              } else {
                resolve(false);
              }
            },
          });
        } else {
          // 已经授权了
          resolve(true);
        }
      },
      fail() {
        resolve(false);
      },
    });
  });
};

export default authorize;
