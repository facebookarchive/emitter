// function calls get bound so "possible strict mode violations" aren't
// jshint -W040

'use strict';

var grunt = require('grunt');

var BOWER_PATH = '../fbemitter/';
var BOWER_GLOB = [BOWER_PATH + '*'];
var BOWER_FILES = ['fbemitter.js', 'fbemitter.min.js', 'JSXTransformer.js'];

var STARTER_PATH = 'starter/';
var STARTER_GLOB = [STARTER_PATH  + '/**/*.*'];

var STARTER_BUILD_PATH = 'build/starter/';

var JS_PATH = 'build/';
var JS_GLOB = [JS_PATH + '/*.js'];

var VERSION;
var VERSION_STRING;

function _gitCommitAndTag(cwd, commitMsg, tag, cb) {
  // `git add *` to make sure we catch untracked files
  // `git add -u` to make sure we remove deleted files
  // `git commit -m {commitMsg}`
  // `git tag -a {tag}`
  var opts = { cwd: cwd};
  var gitAddAll = {
    cmd: 'git',
    args: ['add', '*'],
    opts: opts
  };
  var gitAddDel = {
    cmd: 'git',
    args: ['add', '-u'],
    opts: opts
  };
  var gitCommit = {
    cmd: 'git',
    args: ['commit', '-m', commitMsg],
    opts: opts
  };
  var gitTag = {
    cmd: 'git',
    args: ['tag', tag],
    opts: opts
  };
  grunt.util.spawn(gitAddAll, function() {
    grunt.util.spawn(gitAddDel, function() {
      grunt.util.spawn(gitCommit, function() {
        if (tag) {
          grunt.util.spawn(gitTag, cb);
        }
        else {
          cb();
        }
      });
    });
  });
}

function setup() {
  if (!grunt.file.exists(BOWER_PATH)) {
    grunt.log.error(
      'Make sure you have the fbemitter repository checked out at ' +
      '../fbemitter'
    );
    return false;
  }

  VERSION = grunt.config.data.pkg.version;
  VERSION_STRING = 'v' + VERSION;
}

function bower() {
  var done = this.async();

  // read current bower.json
  var bowerFilePath = BOWER_PATH + 'bower.json';
  var bowerInfo = grunt.file.readJSON(bowerFilePath);

  // clean out the bower folder in case we're removing files
  var files = grunt.file.expand(BOWER_GLOB);
  files.forEach(function(file) {
    grunt.file.delete(file, { force: true });
  });

  // Update bower package version and save the file back.
  bowerInfo.version = VERSION;
  var bowerFileContents = JSON.stringify(bowerInfo, null, 2);
  grunt.file.write(bowerFilePath, bowerFileContents);

  // Now copy over build files
  BOWER_FILES.forEach(function(file) {
    grunt.file.copy('build/' + file, BOWER_PATH + file);
  });

  // Commit and tag the repo
  _gitCommitAndTag(BOWER_PATH, VERSION_STRING, VERSION_STRING, done);
}

function msg() {
  // Just output a friendly reminder message for the rest of the process
  grunt.log.subhead('Release *almost* complete...');
  [
    'Still todo:',
    '* put files on CDN',
    '* push changes to git repositories',
    '* publish npm module (`npm publish .`)',
    '* publish gem (`gem push react-source-' + VERSION + '.gem`)',
    '* announce it on FB/Twitter/mailing list'
  ].forEach(function(ln) {
    grunt.log.writeln(ln);
  });
}

function starter() {
  // Copy over starter/ to build/starter/

  grunt.file.expand(STARTER_GLOB).forEach(function(file) {
    grunt.file.copy(
      file,
      'build/' + file
    );
  });

  grunt.file.expand(JS_GLOB).forEach(function(file) {
    grunt.file.copy(
      file,
      STARTER_BUILD_PATH + file
    );
  });
}

module.exports = {
  setup: setup,
  bower: bower,
  msg: msg,
  starter: starter
};
