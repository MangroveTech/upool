var UPool = require('../').UPool;
var UQueue = require('../').UQueue;

var test = require('tape');

test('test data', function (t) {
  t.plan(6);
  var data = {
    "i": 1,
    "j": 2
  };
  var upool = new UPool({
    "data": data,
    "job": function (task, callback) {
      this.data.ts = 'test';

      t.deepEqual(this.user, 'cn.lixiaojun@gmail.com');
      t.deepEqual(task, 'hello');
      t.deepEqual(this.data.i, 1);
      t.deepEqual(this.data.j, 2);
      t.deepEqual(this.data.ts, 'test');
      callback();
    },
    "close": function () {
      delete this.data.ts;
    }
  });
  upool.run('cn.lixiaojun@gmail.com', 'hello', function () {
    upool.close();
    setTimeout(function () {
      t.notOk(data.ts);
    }, 500);
    console.log('finished');
  });

});