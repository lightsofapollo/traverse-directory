suite('copyfile action', function() {
  var cloneDir = require('../');
  var fs = require('fs');

  var source = FIXTURES + '/read/a/a.js';
  var target = __dirname + '/fixtures/myfile';

  teardown(function() {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  });

  test('copies contents from source to target', function(done) {
    var clone = cloneDir();

    cloneDir.symlink({}, source, target, function(err) {
      assert.equal(
        fs.readFileSync(target, 'utf8'),
        fs.readFileSync(source, 'utf8')
      );
      done();
    });
  });
});

