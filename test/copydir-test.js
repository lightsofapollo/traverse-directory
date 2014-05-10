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
  function readTree(root) {
    var output = {};
    root = fsPath.normalize(root);

    setup(function(done) {
      var traverse = traverseDir(root, '/dev/null');

      traverse.file(function(source, target, next) {
        output[source.replace(root, '')] = fs.readFileSync(source, 'utf8');
        next();
      });

      traverse.directory(function(source, target, next) {
        next(traverseDir.readdir, source, target);
      });

      traverse.run(done);
    });

    return output;
  }

  /**
   * Copies the contents of one directory to another.
   *
   * @param {String} source to copy.
   * @param {String} target of copy.
   */
  function copyDir(source, target) {
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
  }

  suite('with creation of target dir', function() {
    // define the expected output
    var expected = readTree(source);
    // copy the source
    copyDir(source, target);
    // read contents of output
    var output = readTree(target);

    test('result of copy', function() {
      assert.deepEqual(
        expected,
        output
      );
    });
  });

  suite('without the creation of target dir', function() {
    // define the expected output
    var expected = readTree(source);

    // mkdir the target
    setup(function() {
      fs.mkdirSync(target);
    });

    // copy the source
    copyDir(source, target);
    // read contents of output
    var output = readTree(target);

    test('result of copy', function() {
      assert.deepEqual(
        expected,
        output
      );
    });
  });

});
