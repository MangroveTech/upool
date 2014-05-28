var async = require('async');
var debug = require('debug')('upool');

var UQueue = require('./uqueue');

/**
 * User task pool
 *
 * options
 *  - **cleanInterval**, {Number} Interval that check and clean invaild queue of user. 
 *
 * @param {Object} qConfig   Queue config
 * @param {Object} options   Pool config
 */
function UPool(qConfig, options) {
  this._pool = {};
  this._length = 0;
  this._closed = false;

  options = options || {};
  this.cleanInterval = options.cleanInterval || 30 * 1000;

  this.qConfig = qConfig || {
    "data": {},
    "expired": 60 * 1000
  };
  this._startClean();
}

/**
 * Run task
 */
UPool.prototype.run = function run(user, task, cb) {
  var self = this;
  debug('%s run task %j', user, task);
  if (self._closed) {
    console.warn('Pool has been closed.');
    return;
  }

  if (typeof user !== 'string' || !user || !task) {
    setImmediate(function () {
      cb(new Error('Arguments error, %j', arguments));
    });
  }

  var uq = self._uqueue(user);
  uq.push(task, cb);
};

/**
 * add uqueue to pool
 */
UPool.prototype._addUqueue = function (uq) {
  var self = this;
  var user = uq.user;

  if (!self._pool[user]) {
    self._pool[user] = uq;
    self._length += 1;
  } else {
    self._pool[user] = uq;
  }
};

/**
 * remove uqueue from pool
 */
UPool.prototype._deleteUqueue = function (user) {
  var self = this;

  if (self._pool[user]) {
    delete self._pool[user];
    self._length -= 1;
  }
};

/**
 * generate uqueue for user
 */
UPool.prototype._uqueue = function (user) {
  var self = this;
  var uq = self._pool[user];
  if (!uq) {
    debug('create new UQueue for %s', user);
    uq = new UQueue(user, self.qConfig);
    self._addUqueue(uq);
  }

  return uq;
};

/**
 * clean uqueue that has expired.
 */
UPool.prototype._startClean = function () {
  var self = this;

  self.cleaner = setInterval(function () {
    if (self._length) {
      debug('cleaner -> check pool (%d)', self._length);
      Object.keys(self._pool).forEach(function (user) {
        var uq = self._pool[user];
        if (!uq.vaild()) {
          uq.release();
          self._deleteUqueue(user);
          debug('cleaner -> cleanup %s', user);
        }
      });
    } else {
      debug('cleaner -> user pool is empty');
    }
  }, this.cleanInterval);
};

UPool.prototype.close = function close() {
  var self = this;
  self.closed = true;
  if (self.cleaner) {
    clearInterval(self.cleaner);
  }
  Object.keys(self._pool).forEach(function (user) {
    var uq = self._pool[user];
    uq.release();
  });
};

module.exports = UPool;