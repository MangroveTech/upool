var UPool = require('../lib/upool');
var UQueue = require('../lib/uqueue');

var test = require('tape');

test('Test UQueue', function (t) {
  t.plan(6);
  var upool = new UPool(1, {
    init: function () {
      this.name = 'lixiaojun';
    },
    job: function (task, next) {
      t.deepEqual(this.name, 'lixiaojun');
      t.ok(task, 'Task should be a object.');
      t.ok(this._queueId, 'UQueue ID should not be empty.');
      t.ok(this._queue, 'Queue should not be null.');
      t.ok(this.status(), 'uqueue.status() should return a object.');
      next();
    }
  });

  upool.push('lixiaojun@gmail.com', {user: '123'}, function () {
    t.ok(true, 'Callback should be called.');
  });
});

test('Test UPool', function (t) {
  t.plan(13);
  var upool = new UPool(2, {
    init: function () {
      this.name = 'name';
    },
    job: function (task, next) {
      t.ok(task, 'Task should be a object.');
      t.deepEqual(this.name, 'name', 'init method should be called.');
      t.ok(typeof this.destroy === 'function', 'this.destroy should be function.');
      t.ok(typeof this.custom1 === 'function', 'this.custom1 should be function.');
      t.ok(this.customName === 'customName', 'this.customName should equal `customName`');
      next();
    },
    destroy: function () {
      t.ok(true, 'destroy should be called.');
    },
    customs: {
      customName: 'customName',
      custom1: function () {
        console.log('custom1, 123');
      }
    }

  });
  t.ok(upool.size === 2, 'Pool size should be 2.');
  t.ok(upool.keys.length === 2);
  t.ok(upool.pool[upool.keys[0]], 'uqueue should not be null.');
  t.ok(upool.getQueue('haha'), 'getQueue() should return value.');

  upool.push('lixiaojun@gmail.com', {user: '123'}, function () {
    upool.destroy();
    t.ok(upool.closed, 'upool.closed');
    t.notOk(upool.pool, 'pool should be empty.');
  });
});