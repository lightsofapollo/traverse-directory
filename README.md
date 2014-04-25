traverse-directory
===============

[![Build
Status](https://travis-ci.org/lightsofapollo/traverse-directory.png)](https://travis-ci.org/lightsofapollo/traverse-directory)

Traverse directories with various ways of reading/copying/symlink directories.
The intent is primarily cases where you want to do complex cloning of one directory into another.

## Usage

Traverse directory is an async queue. Each operation is added to the
queue (but operations run in parallel) and when no more operations are
left on the queue the traverse directory is complete.


```js
var TraverseDirectory = require('traverse-directory');

var traverse = new TraverseDirectory(
  '/path/to/source', /* source directory */
  '/path/to/dest' /* path to target */
);

// the target directory will be created if it does not exist already.

/**
Handle directories starting with the source

@param {String} source directory.
@param {String} target directory (this does not exist yet).
@param {Function} next see usage below.
*/
traverse.directory(function(source, target, next) {
  /**
  the "next" argument is a function which expects three arguments
  which handle how the source / target are handled.

  You must call next() to indicate that the item has been handled.
  If you have no action to take, just call next() with no arguments.

  @param {Function} action (see below) to handle source/target.
  @param {String} source path.
  @param {String} target path.
  */
  next(TraverseDirectory.copydir, source, target);
});

/**
Handle file found in a directory. Unlike the directory
command file is optional (though generally needed).

@param {String} source directory.
@param {String} target directory (this does not exist yet).
@param {Function} next see usage below.
*/
traverse.file(function(source, target, next) {
  // see directory
});

traverse.run(function(err) {
  // traversal is complete
});

// after run is called event listeners can be added in addition.
traverse.on('error', ...);
traverse.on('complete', ...);
```

## Actions

The "next" argument above takes an action as the first argument.

```js
TraverseDirectory = require('traverse-directory');
// ...

// somewhere in the directory or file methods.
next(TraverseDirectory[ACTION_NAME], source, target);

// If you are doing something inline that doesn't need handing
// off to an action, just call without arguments
next();
```

For examples on how to write actions see index.js.

## For files:

### TraverseDirectory.copyfile
copies the contents of a file

### TraverseDirectory.symlinkfile
symlinks file from source to dest

## For directories:

### TraverseDirectory.readdir
reads all files in directory (triggers the call to traverse.file)

### TraverseDirectory.copydir
Calls readdir and creates a directory in the target path.
This action does _not_ affect files.

### TraverseDirectory.symlinkdir
Symlinks target directory to source directory.
