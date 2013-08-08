suite('symlinkfile action', function() {
  var traverseDir = require('../');
  var fs = require('fs');
  var fsPath = require('path')

  var source = fsPath.normalize(fsPath.join(FIXTURES, 'read/'));
  var target = __dirname + '/symlink-me';

  teardown(function() {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  });

  test('symlinks from source to target', function(done) {
    var traverse = traverseDir();

    traverseDir.symlinkdir({}, source, target, function(err) {
      assert.equal(
        source,
        fs.readlinkSync(target),
        'is symlinked'
      );
      done();
    });
  });
});
