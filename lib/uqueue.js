var async = require('async');
var debug = require('debug')('upool:uqueue');

/**
 * The queue of user.
 * 
 * @param {String} queueId Unique identifier, e.g. email address.
 * @param {Object} config The description of task.
 *   - {Number} concurrency n integer for determining how many worker functions should be run in parallel. 
 *   - {Function} init A function which no parameter. Only called once when uqueue init.
 *   - {Function} job  A function which accepts 2 parameters (task, next).
 *   - {Function} destroy A function which no parameter. Called when destroy uqueue.
 *   - {Object} customs Functions Object, they will be bind to uqueue.
 */
function UQueue(config) {
  config = config || {};

  this._processed = 0;
  this._since = Date.now();
  this._recentUse = 0;
  this._queue = null;

  this._config = {};
  this._config.concurrency = config.concurrency || 1;
  this._config.init = config.init;
  this._config.job = config.job;
  this._config.destroy = config.destroy;
  this._config.customs = config.customs;


  this.init();
}

UQueue.prototype.init = function init() {
  var self = this;

  if (typeof this._config.init === 'function') {
    this._config.init.call(this);
  }

  if (typeof this._config.job !== 'function') {
    this._config.job = function (task, next) {
      console.warn('Do job -> ', task);
      next();
    };
  }

  if (typeof this._config.destroy !== 'function') {
    this._config.destroy = null;
  }

  if (this._config.customs) {
    Object.keys(this._config.customs).forEach(function (key) {
      if (!self[key]) {
        self[key] = self._config.customs[key];
      }
    });
  }

  self._queue = async.queue(function (task, callback) {
    self._recentUse = Date.now();
    self._processed++;

    self._config.job.call(self, task, callback);
  }, self._config.concurrency);
};

/*
 * Push a task to queue.
 */
UQueue.prototype.push = function push(task, cb) {
  var self = this;
  debug('Got a task -> ', task);
  self._queue.push(task, cb);
};

/*
 * Destroy uqueue.
 */
UQueue.prototype.destroy = function destroy() {
  var self = this;
  if (self._config.destroy) {
    self._config.destroy.call(self);
  }
};

/*
 * Get the current running status.
 */
UQueue.prototype.status = function status() {
  return {
    createdAt: this._since,
    recentUse: this._recentUse,
    processed: this._processed,

    queue: {
      length: this._queue.length(),
      started: this._queue.started,
      running: this._queue.running()
    }
  };
};

module.exports = UQueue;