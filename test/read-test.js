suite('read', function() {
  var subject;
  var traverseDir = require('../');
  var fs = require('fs');

  function aggregateWithClone(traverse) {
    var result = [];
    // handle files by simply saving the record of each
    traverse.file(function(source, target, next) {
      result.push(source);
      // skip no action needed for this one
      next();
    });

    // directories simply scan
    traverse.directory(function(source, target, next) {
      next(traverseDir.readdir, source, target);
    });

    return result;
  }

  suite('when root directory exists', function() {
    var root = FIXTURES + 'read/';
    var result;
    setup(function(done) {
      // define the traverse (in this case we only read)
      subject = traverseDir(root, '/dev/null');

      // aggregate results.
      result = aggregateWithClone(subject);

      // execute the traverse
      subject.run(done);
    });

    var expected = [
      root + 'a/a.js',
      root + 'b/b.js',
      root + 'c/c.js',
      root + 'c/nested_c/nested_c.js'
    ];

    test('result', function() {
      assert.deepEqual(
        expected.sort(),
        result.sort()
      );
    });
  });

  suite('empty directory', function() {
    var result;
    var empty = FIXTURES + '/empty/';

    teardown(function() {
      if (fs.existsSync(empty)) {
        fs.rmdirSync(empty);
      }
    });

    setup(function(done) {
      // create an empty dir to test.
      fs.mkdirSync(empty);

      subject = new traverseDir(empty, '/dev/null');
      result = aggregateWithClone(subject, done);
      subject.run(done);
    });

    test('should be empty', function() {
      assert.deepEqual(result, []);
    });
  });
});
