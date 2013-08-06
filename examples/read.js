var traverseDir = require('../');

var traverse = traverseDir(__dirname + '/../', '/dev/null');

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

traverse.run(function() {
  console.log(result);
  process.exit();
});
