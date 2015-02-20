'use strict';

var exec = require('child_process').exec;
var jsxTask = require('./grunt/tasks/jsx');
var browserifyTask = require('./grunt/tasks/browserify');
var wrapupTask = require('./grunt/tasks/wrapup');
var phantomTask = require('./grunt/tasks/phantom');
var releaseTasks = require('./grunt/tasks/release');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: require('./grunt/config/copy'),
    jsx: require('./grunt/config/jsx'),
    browserify: require('./grunt/config/browserify'),
    wrapup: require('./grunt/config/wrapup'),
    phantom: require('./grunt/config/phantom'),
    clean: ['./build'],
    jshint: require('./grunt/config/jshint'),
    compare_size: require('./grunt/config/compare_size')
  });

  grunt.config.set('compress', require('./grunt/config/compress'));

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-compare-size');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Alias 'jshint' to 'lint' to better match the workflow we know
  grunt.registerTask('lint', ['jshint']);

  // Register jsx:debug and :release tasks.
  grunt.registerMultiTask('jsx', jsxTask);

  // Our own browserify-based tasks to build a single JS file build
  grunt.registerMultiTask('browserify', browserifyTask);

  // Similar to Browserify, use WrapUp to generate single JS file that
  // defines global variables instead of using require.
  grunt.registerMultiTask('wrapup', wrapupTask);

  grunt.registerMultiTask('phantom', phantomTask);

  grunt.registerTask('build:basic', ['jsx:debug', 'browserify:basic']);
  grunt.registerTask('build:min', ['jsx:release', 'browserify:min']);
  grunt.registerTask('build:test', [
    'jsx:debug',
    'jsx:test',
    'browserify:test'
  ]);

  grunt.registerTask('test', ['build:test']);

  // Optimized build task that does all of our builds. The subtasks will be run
  // in order so we can take advantage of that and only run jsx:debug once.
  grunt.registerTask('build', [
    'jsx:debug',
    'browserify:basic',
    'jsx:release',
    'browserify:min',
    'compare_size'
  ]);

  // Automate the release!
  grunt.registerTask('release:setup', releaseTasks.setup);
  grunt.registerTask('release:bower', releaseTasks.bower);
  grunt.registerTask('release:docs', releaseTasks.docs);
  grunt.registerTask('release:msg', releaseTasks.msg);
  grunt.registerTask('release:starter', releaseTasks.starter);

  grunt.registerTask('release', [
    'release:setup',
    'clean',
    'build',
    'gem:only',
    'release:bower',
    'release:starter',
    'compress',
    'release:docs',
    'release:msg'
  ]);

  // The default task - build - to keep setup easy
  grunt.registerTask('default', ['build']);
};
