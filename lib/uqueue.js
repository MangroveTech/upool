var async = require('async');
var debug = require('debug')('uqueue');

/**
 * Task queue of user
 *
 * config
 *  - **data**, {Object}   Data be used to handle task.
 *  - **job**, {Function} Task function
 *  - **close**, {Function} Call it when user's queue be clean.
 *  - **expired**, {Number} Expired time (ms) of queue.
 * 
 * @param {String} user   user identifier e.g. email address
 * @param {Object} config queue config
 */
function UQueue(user, config) {
  var self = this;

  self.user = user;
  self.usedAt = 0;
  self.createdAt = Date.now();

  config = config || {};
  self.data = config.data;
  self.expired = config.expired || 60 * 1000;
  self.job = config.job || function (task, callback) {
    console.log('do job, %s', task);
    callback();
  };
  self.close = config.close || function () {
    console.log('%s close', self.user);
  };

  self._init();
  debug('init with %s, %s', user, config);
}

UQueue.prototype._init = function () {
  var self = this;

  self.q = async.queue(function (task, callback) {
    self.job(task, callback);
  }, 1);
};

/**
 * Interface that determine whether the queue is vaild
 * @return {Boolean} Returns true if queue is vaild else false.
 */
UQueue.prototype.vaild = function vaild() {
  var self = this;

  debug('vaild -> idle(%d), usedAt(%d)', self.q.idle(), self.usedAt);
  if (!self.q.idle()) {
    return true;
  }
  if (Date.now() - self.usedAt < self.expired) {
    return true;
  }
  return false;
};

/**
 * Release was called when the queue is cleaned from pool.
 */
UQueue.prototype.release = function release() {
  var self = this;
  self.q.drain = function () {
    self.close();
  };
};

/**
 * Push a task into queue
 */
UQueue.prototype.push = function push(task, cb) {
  var self = this;
  self.usedAt = Date.now();
  self.q.push(task, cb);
};

module.exports = UQueue;