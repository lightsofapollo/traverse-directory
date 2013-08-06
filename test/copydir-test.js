suite('copydir', function() {
  var traverseDir = require('../');
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
    var traverse = traverseDir(root, '/dev/null');

    traverse.file(function(source) {
      output[source.replace(root, '')] = fs.readFileSync(source, 'utf8');
    });

    traverse.directory(function(source, target, next) {
      next(traverseDir.readdir, source, target);
    });

    traverse.run(callback);
    return output;
  }

  // define the expected output
  var expected;
  setup(function(done) {
    expected = readTree(source, done);
  });

  // copy the contents of all files/directories
  setup(function(done) {
    var traverse = traverseDir(source, target);

    traverse.file(function(source, target, next) {
      next(traverseDir.copyfile, source, target);
    });

    traverse.directory(function(source, target, next) {
      next(traverseDir.copydir, source, target);
    });

    traverse.run(done);
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
