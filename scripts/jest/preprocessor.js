/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const assign = require('object-assign');
const babel = require('@babel/core');
const babelOpts = require('../babel/default-options');

module.exports = {
  process: function (src, path) {
    return babel.transform(src, assign({ filename: path }, babelOpts)).code;
  },
};
