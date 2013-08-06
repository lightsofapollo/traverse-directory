var traverseDir = require('../');
var remove = require('remove');
var fs = require('fs');

var TARGET = __dirname + '/cp';

if (fs.existsSync(TARGET)) {
  remove.removeSync(TARGET);
}

var traverse = traverseDir(__dirname + '/../', TARGET);

var result = [];
// handle files by simply saving the record of each
traverse.file(function(source, target, next) {
  next(traverseDir.copyfile, source, target);
});

// directories simply scan
traverse.directory(function(source, target, next) {
  if (source.indexOf('.git') !== -1) {
    return next();
  }
  next(traverseDir.copydir, source, target);
});

traverse.run(function() {
  process.exit();
});

