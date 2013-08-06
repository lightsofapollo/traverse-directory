suite('error', function() {
  var cloneDir = require('../');
  var root = __dirname + '/fixtures/';

  suite('attempting to clone missing directory', function() {
    test('it should emit error event', function(done) {
      var subject = cloneDir(root + '/foobar/', '/dev/null');
      var sentError = false;
      var sentComplete = false;

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
