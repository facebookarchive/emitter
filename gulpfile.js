const babel = require('gulp-babel');
const del = require('del');
const flatten = require('gulp-flatten');
const { dest, series, src } = require('gulp');
const runSequence = require('run-sequence');

const babelOpts = require('./scripts/babel/default-options');

const paths = {
  src: [
    'src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js',
  ],
  lib: 'lib',
};

function clean() {
  return del([paths.lib]);
}

function lib() {
  return src(paths.src)
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(dest(paths.lib));
}

const build = series(clean, lib);

exports.clean = clean;
exports.lib = lib;
exports.build = build;
exports.default = build;
