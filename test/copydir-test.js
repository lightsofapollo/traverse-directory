suite('copydir', function() {
  var cloneDir = require('../');
  var source = FIXTURES + '/read/';
  var target = FIXTURES + '/read-out/';
  var remove = require('remove');
  var fs = require('fs');
  var fsPath = require('path');

  function clear(done) {
    if (!fs.existsSync(target)) {
      done();
      return;
    }

    remove(target, done);
  }

  setup(clear);
  teardown(clear);

  /**
   * Reads the contents of all files in the given directory.
   *
   * @param {String} root to read.
   * @param {Function} callback usually mocha's done.
   * @return {Object} key (filename) value (contents) pair.
   */
  function readTree(root, callback) {
    root = fsPath.normalize(root);
    var output = {};
    var clone = cloneDir(root, '/dev/null');

    clone.file(function(source) {
      output[source.replace(root, '')] = fs.readFileSync(source, 'utf8');
    });

    clone.directory(function(source, target, next) {
      next(cloneDir.readdir, source, target);
    });

    clone.run(callback);
    return output;
  }

  // define the expected output
  var expected;
  setup(function(done) {
    expected = readTree(source, done);
  });

  // copy the contents of all files/directories
  setup(function(done) {
    var clone = cloneDir(source, target);

    clone.file(function(source, target, next) {
      next(cloneDir.copyfile, source, target);
    });

    clone.directory(function(source, target, next) {
      next(cloneDir.copydir, source, target);
    });

    clone.run(done);
  });

  var output;
  setup(function(done) {
    output = readTree(target, done);
  });

  test('result of copy', function() {
    assert.deepEqual(
      expected,
      output
    );
  });
});
