var babel = require('gulp-babel');
var del = require('del');
var flatten = require('gulp-flatten');
var gulp = require('gulp');
var runSequence = require('run-sequence');

var babelOpts = require('./scripts/babel/default-options');

var paths = {
  src: [
    'src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js'
  ],
  lib: 'lib'
};

gulp.task('clean', function() {
  return del([paths.lib]);
});

gulp.task('lib', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('build', function(cb) {
  runSequence('clean', ['lib'], cb);
});

gulp.task('default', ['build']);
