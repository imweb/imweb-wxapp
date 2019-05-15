class Storage {
  /**
   * Storage 构造函数
   * @param {String} options.namespace 命名空间
   */
  constructor({ namespace = 'temp' } = {}) {
    this.namespace = `__storage__/${namespace}/`;
    this.cache = Object.create(null);
    const { keys } = wx.getStorageInfoSync();

    if (Object.prototype.toString.call(keys) === '[object Array]') {
      this.cache = keys
        .filter((k) => k.indexOf(this.namespace) > -1)
        .reduce((acc, cur) => {
          acc[cur.replace(this.namespace, '')] = undefined;
          return acc;
        }, this.cache);
    }
  }

  /**
   * 检测 storage 中是否存在指定数据
   *
   * @param {String} key 键值
   * @returns {Boolean} 是否存在
   */
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.cache, key);
  }

  /**
   * 清空 storage
   * @returns {Undefined}
   */
  clear() {
    Object.keys(this.cache).forEach((key) => this.remove(key));
  }

  /**
   * 删除指定数据
   * @param {String} key 键值
   * @returns {Undefined}
   */
  remove(key) {
    if (this.has(key)) {
      wx.removeStorageSync(`${this.namespace}${key}`);
      delete this.cache[key];
    }
  }

  /**
   * 获取指定数据
   * @param {String} key 键值
   * @returns {*|Undefined} 数据，如果不存在则返回 undefined
   */
  get(key) {
    if (this.has(key)) {
      const value = this.cache[key];
      if (value === undefined) {
        const data = wx.getStorageSync(`${this.namespace}${key}`);
        this.cache[key] = data;
        return data;
      }
      return value;
    }
    return undefined;
  }

  /**
   * 设置指定数据
   * @param {String} key 键值
   * @param {*} data 数据
   * @returns {Undefined}
   * @throws Error
   */
  set(key, data) {
    if (key === undefined || data === undefined) {
      throw new Error('STORAGE_ERROR_SET_UNDEFINED_DISALLOWED');
    } else {
      // TODO: 预留操作符，等哪位有能力的后生来实现 eg: storage.set('a.b[0].c',1)
      if (/[[]/.test(key)) {
        throw new Error('STORAGE_ERROR_SET_BRACKET_NOT_SUPPORTED');
      }
      if (/\./.test(key)) {
        const [root, first, ...rest] = key.split('.');
        // TODO: 只支持一个层级
        if (rest.length > 0) {
          throw new Error('STORAGE_ERROR_SET_MUTIL_DOT_NOT_SUPPORTED');
        } else {
          let rootData = this.get(root);
          if (typeof rootData !== 'object') {
            rootData = {};
          }
          rootData[first] = data;
          this.set(root, rootData);
        }
      } else {
        try {
          this.cache[key] = data;
          wx.setStorageSync(`${this.namespace}${key}`, data);
        } catch (err) {
          throw new Error(`STORAGE_ERROR_SET_FAIL:${err.message}`);
        }
      }
    }
  }
}

export default Storage;
