# weapp-storage
微信小程序 storage 组件

## 使用

```
npm install -S weapp-storage
```

``` js
import { storage } from 'weapp-storage';

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
