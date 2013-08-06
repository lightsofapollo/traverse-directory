suite('read', function() {
  var subject;
  var cloneDir = require('../');
  var fixtures = __dirname + '/fixtures/';

  function aggregateWithClone(clone) {
    var result = [];
    // handle files by simply saving the record of each
    clone.file(function(source, target, next) {
      result.push(source);
      // skip no action needed for this one
      next();
    });

    // directories simply scan
    clone.directory(function(source, target, next) {
      next(cloneDir.readdir, source, target);
    });

    return result;
  }

  suite('when root directory exists', function() {
    var root = fixtures + 'read/';
    var result;
    setup(function(done) {
      // define the clone (in this case we only read)
      subject = cloneDir(root, '/dev/null');

      // aggregate results.
      result = aggregateWithClone(subject);

      // execute the clone
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

    setup(function(done) {
      subject = new cloneDir(fixtures + '/empty/', '/dev/null');
      result = aggregateWithClone(subject, done);
      subject.run(done);
    });

    test('should be empty', function() {
      assert.deepEqual(result, []);
    });
  });
});
