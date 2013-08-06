suite('symlink a directory and a file', function() {
  var cloneDir = require('../');
  var fs = require('fs');

  var source = FIXTURES;
  var target = __dirname + '/fixtures-sym';

  teardown(function() {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  });

  test('symlink fixtures to fixtures-sym', function(done) {
    var clone = cloneDir();

    cloneDir.symlink({}, source, target, function(err) {
      if (err) return done(err);
      var stat = fs.lstatSync(target);
      assert.ok(stat.isSymbolicLink(), target + ' is symlink');

      var realPath = fs.readlinkSync(target);
      assert.equal(source, realPath, 'symlink ' + source + ' is linked to ' + target);
      done();
    });
  });
});
