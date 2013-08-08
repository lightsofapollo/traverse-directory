suite('symlinkfile action', function() {
  var traverseDir = require('../');
  var fs = require('fs');

  var source = FIXTURES + '/read/a/a.js';
  var target = __dirname + '/fixtures/myfile';

  teardown(function() {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  });

  test('symlinks from source to target', function(done) {
    var traverse = traverseDir();

    traverseDir.symlinkfile({}, source, target, function(err) {
      assert.equal(
        source,
        fs.readlinkSync(target),
        'is symlinked'
      );
      done();
    });
  });
});


