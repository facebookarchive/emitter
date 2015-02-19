'use strict';

var grunt = require('grunt');
var objectAssign = require('object-assign');

var rootIDs = [
  "fbemitter"
];

var debug = {
  rootIDs: rootIDs,
  getConfig: function() {
    return {
      commonerConfig: grunt.config.data.pkg.commonerConfig,
      constants: {}
    }
  },
  sourceDir: "src",
  outputDir: "build/modules"
};

var test = {
  rootIDs: rootIDs.concat([
    "test/all.js",
    "**/__tests__/*.js"
  ]),
  getConfig: function() {
    return objectAssign({}, release.getConfig(), {
      mocking: true
    });
  },
  sourceDir: "src",
  outputDir: "build/modules"
};

var release = {
  rootIDs: rootIDs,
  getConfig: function() {
    return {
      commonerConfig: grunt.config.data.pkg.commonerConfig,
      constants: {}
    }
  },
  sourceDir: "src",
  outputDir: "build/modules"
};

module.exports = {
  debug: debug,
  test: test,
  release: release
};
