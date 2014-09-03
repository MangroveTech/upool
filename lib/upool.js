var async = require('async');
var HashRing = require('hashring');
var debug = require('debug')('upool');

var UQueue = require('./uqueue');

/*
 * The pool of user queue.
 */
function UPool(size, queueConfig) {
  this.queueConfig = queueConfig;

  this.keys = [];
  this.size = size || 2;
  this.pool = {};
  this.ring = null;
  this.closed = false;
  this.init();
}

UPool.prototype.init = function init() {
  var i = 0, key;
  for (i = 0; i < this.size; i++) {
    key = 'key_' + i;

    this.keys.push(key);
    this.pool[key] = new UQueue(key, this.queueConfig);
  }
  this.ring = new HashRing(this.keys);
};

UPool.prototype.push = function push(uid, task, cb) {
  if (this.closed) {
    console.warn('Pool has been closed.');
    return;
  }

  var uqueue = this.getQueue(uid);
  debug('Arrange task of %s -> %s ', uid, uqueue.queueId);
  uqueue.push(task, cb);
};

UPool.prototype.getQueue = function getQueue(uid) {
  var key = this.ring.get(uid);
  return this.pool[key];
};

UPool.prototype.destroy = function destroy() {
  var self = this;

  this.closed = true;
  Object.keys(this.pool).forEach(function (key) {
    self.pool[key].destroy();
    self.pool[key] = null;
  });
  this.pool = null;
  this.size = 0;
  this.keys = null;
  this.ring = null;
};

module.exports = UPool;

