upool
=====

Job queue pool for each user

### Installation

```sh
$ npm install upool --save
```

### Usage

```js
var upool = new UPool(2, {
  concurrency: 1,
  init: function () {
    this.name = 'name';
  },
  job: function (task, next) {
    console.log('handle task -> ', task);
    console.log('this.customName: ', this.customName);
    next();
  },
  destroy: function () {
    this.name = null;
    this.customName = null;
  },
  customs: {
    customName: 'customName',
    custom1: function () {
      console.log('custom1, 123');
    }
  }
});

upool.push('cn.lixiaojun@gmail.com', {task: '123'}, function (err) {
  // callback
});

...

upool.destroy();

```


### License

MIT