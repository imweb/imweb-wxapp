# storage
微信小程序基础组件库 storage 组件，处理本地缓存功能，类似 web 的 `localStorage`

## 使用

```
npm install -S @imweb/weapp-utils
```

``` js
import { storage } from '@imweb/weapp-utils';

Page({
  async onLoad() {
    storage.set('test', 1);

    const hasKey = storage.has('test');
    const v = storage.get('test');

    console.log(v, hasKey);

    storage.remove('test');
    // storage.clear();
  },
});
```

## 文档
### Storage
类，本地缓存可以有多个，根据 `namespace` 来区分

#### Constructor(options: Objecct)
- `options.namespace`：**default: 'temp'**，本地缓存对象的命名空间，用于区分

#### Methods
##### has(key: String): Boolean
检测 storage 中是否存在 `key` 指定的数据

##### clear(): Undefined
清空 storage

##### remove(key: String): Undefined
删除 `key` 指定的数据

##### get(key: String): \*
获取 `key` 指定数据

##### set(key: String, data: \*)
设置 `key` 指定数据 `data`

###### throw errors
- `new Error('STORAGE_ERROR_SET_UNDEFINED_DISALLOWED')`: `key` 或者
 `data` 是
 `undefined`
 - `new Error('STORAGE_ERROR_SET_BRACKET_NOT_SUPPORTED')`: `key` 带
 `[` 字符，目前还不支持
 `[]`的
路径检索
- `new Error('STORAGE_ERROR_SET_MUTIL_DOT_NOT_SUPPORTED')`:  `key` 路径检索超过1层，目前只支持1层，比如 `a.b.c` 不支持

### storage
一个命名空间为 `global` 的本地缓存对象
