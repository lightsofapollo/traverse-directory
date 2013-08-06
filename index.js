var EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    fsPath = require('path');

/**
 * Initiates a clone object. The use of `new` is optional:
 *
 *    var cloneDir = require('clone-directory');
 *    var dir = cloneDir();
 *
 * @constructor
 * @param {String} source to clone.
 * @param {String} target of the clone.
 */
function CloneDirectory(source, target) {
  if (!(this instanceof CloneDirectory))
    return new CloneDirectory(source, target);

  EventEmitter.call(this);

  this.source = source;
  this.target = target;
}

/**
 * `readdir` action designed to continue descent into a given directory.
 *
 * @param {CloneDirectory} clone instance.
 * @param {String} source directory.
 * @param {String} target directory.
 * @param {Function} callback initiates the next action.
 */
CloneDirectory.readdir = function(clone, source, target, callback) {
  // next is our magic state tracking not callback.
  var next = clone.next.bind(clone);

  // number of remaining operations
  var pending = 0;

  /**
   * Check if we are done waiting for operations.
   * @private
   */
  function checkComplete() {
    if (pending === 0) {
      callback && callback();
      return;
    }
  }

  /**
   * If given argument is truthy send argument to callback.
   *
   * @private
   * @param {Object|Null} err to validate.
   * @return {Boolean} true on error false otherwise
   */
  function handleError(err) {
    if (err) {
      callback(err);
      callback = null;
      return true;
    }

    return false;
  }

  /**
   * Wrapper around fs.stat which decides how to process a given leaf.
   *
   *
   * @param {String} pathSource for next action.
   * @param {String} pathTarget for next action.
   * @private
   */
  function stat(pathSource, pathTarget) {
    // stat the leaf
    fs.stat(pathSource, function(err, stat) {
      if (handleError(err))
        return;

      // deal with the file vs directory handlers.
      if (stat.isFile()) {
        clone.handleFile(pathSource, pathTarget, next);
      } else if(stat.isDirectory()) {
        clone.handleDirectory(pathSource, pathTarget, next);
      }

      // remove a pending item from the stack.
      --pending;

      // maybe we are done now?
      checkComplete();
    });
  }

  // read the source directory and build paths
  fs.readdir(source, function(err, list) {
    if (handleError(err))
      return false;

    pending = list.length;

    list.forEach(function(path) {
      // readdir returns a relative path for each item so join to the root.
      var pathSource = fsPath.join(source, path);
      var pathTarget = fsPath.join(target, path);

      // and initialize the stat
      stat(pathSource, pathTarget);
    });

    checkComplete();
  });
};

/**
 * Copies a single directory (no contents) from source to target [mkdir].
 * Additionally the directory is read for future actions.
 *
 * @param {CloneDirectory} clone for action.
 * @param {String} source for action.
 * @param {String} target for action.
 * @param {Function} callback for this action.
 */
CloneDirectory.copydir = function(clone, source, target, callback) {
  fs.mkdir(target, function(err) {
    if (err) {
      callback(err);
      return;
    }

    CloneDirectory.readdir(clone, source, target, callback);
  });
};

/**
 * Copies a file from source to dest.
 *
 * @param {CloneDirectory} clone for action.
 * @param {String} source for action.
 * @param {String} target for action.
 * @param {Function} callback for this action.
 */
CloneDirectory.copyfile = function(clone, source, target, callback) {
  var read = fs.createReadStream(source);
  var write = fs.createWriteStream(target);

  read.pipe(write);

  write.once('finish', callback);
  write.once('error', callback);
};

/***
 * `symlink` action works in both the directory and file cases.
 *
 * NOTE: mostly here so its really obvious you can do this.
 *
 * @param {CloneDirectory} clone for action.
 * @param {String} source for action.
 * @param {String} target for action.
 * @param {Function} callback for this action.
 */
CloneDirectory.symlink = function(clone, source, target, callback) {
  fs.symlink(source, target, callback);
};

CloneDirectory.prototype = {
  __proto__: EventEmitter.prototype,

  /**
   * @type {Number} remaining pending items.
   */
  pending: 0,

  /**
   * @type {Object|Null} last error.
   */
  error: null,

  /**
   * Runs the next item in the stack.
   *
   * If the handler is falsy this will abort in success.
   *
   * @param {Function} handler for this item in the stack.
   * @param {String} source of clone.
   * @param {String} target of clone.
   */
  next: function(handler, source, target) {
    if (!handler) {
      return;
    }

    this.pending++;

    handler(this, source, target, function(err) {
      if (err) {
        this.error = err;
      }

      if (--this.pending === 0) {
        if (this.error) {
          this.emit('error', this.error);
          return;
        }

        this.emit('complete');
      }
    }.bind(this));
  },

  /**
   * Default handler for files.
   */
  handleFile: function() {
    throw new Error('call .file to add a file handler');
  },

  /**
   * Default directory handler.
   */
  handleDirectory: function() {
    throw new Error('call .directory to add a diectory handler');
  },

  /**
   * Add the file handler method.
   *
   * @param {Function} handler for files.
   */
  file: function(handler) {
    if (typeof handler !== 'function')
      throw new Error('handler must be a function.');

    this.handleFile = handler;
  },

  /**
   * Add the directory handler method.
   *
   * @param {Function} handler for directories.
   */
  directory: function(handler) {
    if (typeof handler !== 'function')
      throw new Error('handler must be a function.');

    this.handleDirectory = handler;
  },

  /**
   * Begin cloning process.
   *
   * @param {Function} callback [Error err].
   */
  run: function(callback) {
    if (callback) {
      this.once('error', callback);
      this.once('complete', callback);
    }

    this.handleDirectory(this.source, this.target, this.next.bind(this));
  }
};

module.exports = CloneDirectory;