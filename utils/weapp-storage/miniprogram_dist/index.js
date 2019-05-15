module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.Storage = exports.storage = undefined;

var _Storage = __webpack_require__(1);

var _Storage2 = _interopRequireDefault(_Storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storage = new _Storage2.default({ namespace: 'global' });

exports.storage = storage;
exports.Storage = _Storage2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  /**
   * Storage 构造函数
   * @param {String} options.namespace 命名空间
   */
  function Storage() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$namespace = _ref.namespace,
        namespace = _ref$namespace === undefined ? 'temp' : _ref$namespace;

    _classCallCheck(this, Storage);

    this.namespace = '__storage__/' + namespace + '/';
    this.cache = Object.create(null);

    var _wx$getStorageInfoSyn = wx.getStorageInfoSync(),
        keys = _wx$getStorageInfoSyn.keys;

    if (Object.prototype.toString.call(keys) === '[object Array]') {
      this.cache = keys.filter(function (k) {
        return k.indexOf(_this.namespace) > -1;
      }).reduce(function (acc, cur) {
        acc[cur.replace(_this.namespace, '')] = undefined;
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


  Storage.prototype.has = function has(key) {
    return Object.prototype.hasOwnProperty.call(this.cache, key);
  };

  /**
   * 清空 storage
   * @returns {Undefined}
   */


  Storage.prototype.clear = function clear() {
    var _this2 = this;

    Object.keys(this.cache).forEach(function (key) {
      return _this2.remove(key);
    });
  };

  /**
   * 删除指定数据
   * @param {String} key 键值
   * @returns {Undefined}
   */


  Storage.prototype.remove = function remove(key) {
    if (this.has(key)) {
      wx.removeStorageSync('' + this.namespace + key);
      delete this.cache[key];
    }
  };

  /**
   * 获取指定数据
   * @param {String} key 键值
   * @returns {*|Undefined} 数据，如果不存在则返回 undefined
   */


  Storage.prototype.get = function get(key) {
    if (this.has(key)) {
      var value = this.cache[key];
      if (value === undefined) {
        var data = wx.getStorageSync('' + this.namespace + key);
        this.cache[key] = data;
        return data;
      }
      return value;
    }
    return undefined;
  };

  /**
   * 设置指定数据
   * @param {String} key 键值
   * @param {*} data 数据
   * @returns {Undefined}
   * @throws Error
   */


  Storage.prototype.set = function set(key, data) {
    if (key === undefined || data === undefined) {
      throw new Error('STORAGE_ERROR_SET_UNDEFINED_DISALLOWED');
    } else {
      // TODO: 预留操作符，等哪位有能力的后生来实现 eg: storage.set('a.b[0].c',1)
      if (/[[]/.test(key)) {
        throw new Error('STORAGE_ERROR_SET_BRACKET_NOT_SUPPORTED');
      }
      if (/\./.test(key)) {
        var _key$split = key.split('.'),
            root = _key$split[0],
            first = _key$split[1],
            rest = _key$split.slice(2);
        // TODO: 只支持一个层级


        if (rest.length > 0) {
          throw new Error('STORAGE_ERROR_SET_MUTIL_DOT_NOT_SUPPORTED');
        } else {
          var rootData = this.get(root);
          if ((typeof rootData === 'undefined' ? 'undefined' : _typeof(rootData)) !== 'object') {
            rootData = {};
          }
          rootData[first] = data;
          this.set(root, rootData);
        }
      } else {
        try {
          this.cache[key] = data;
          wx.setStorageSync('' + this.namespace + key, data);
        } catch (err) {
          throw new Error('STORAGE_ERROR_SET_FAIL:' + err.message);
        }
      }
    }
  };

  return Storage;
}();

exports.default = Storage;

/***/ })
/******/ ]);