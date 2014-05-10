suite('symlink a directory tree with files', function() {
  var traverseDir = require('../');
  var fs = require('fs');
  var path = require('path');
  var remove = require('remove');

  var source = path.join(FIXTURES, 'read');
  var target = path.join(FIXTURES, 'read-out');

  teardown(function(done) {
    fs.exists(target, function(exists) {
      if(exists) {
        remove(target, done);
      } else {
        done();
      }
    });
  });

  test('from source to target, asynchronously', function(done) {
    var traverse = traverseDir(source, target);

    traverse.file(function(source, target, next) {
        setTimeout(function() {
            next(traverseDir.symlinkfile, source, target);
        }, 10);
    });

    traverse.directory(function(source, target, next) {
        next(traverseDir.copydir, source, target);
    });

    traverse.run();

    traverse.on('complete', function() {
        done();
    });

    traverse.on('error', function(err) {
        done(err);
    });
  });
});
