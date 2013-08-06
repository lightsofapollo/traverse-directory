suite('error', function() {
  var traverseDir = require('../');
  var fs = require('fs');

  suite('attempting to traverse missing directory', function() {
    test('it should emit error event', function(done) {
      var subject = traverseDir(FIXTURES + '/foobar/', '/dev/null');
      var sentError = false;
      var sentComplete = false;

      subject.directory(function(source, target, next) {
        next(traverseDir.readdir, target, next)
      });

      subject.once('complete', function() {
        sentError = true;
      });

      subject.once('error', function() {
        sentError = true;
      });

      subject.run(function(err) {
        if (!err) return done(new Error('should send error'));
        assert.ok(sentError, 'sends error');
        done();
      });
    });
  });
});
