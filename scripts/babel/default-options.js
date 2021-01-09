/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

module.exports = {
  presets: [
    require('babel-preset-fbjs/configure')({
      rewriteModules: {
        map: {
          emptyFunction: 'fbjs/lib/emptyFunction',
          invariant: 'fbjs/lib/invariant',
          // Hack to workaround Jest no longer understanding Haste.
          BaseEventEmitter: './BaseEventEmitter.js',
          EmitterSubscription: './EmitterSubscription.js',
          EventSubscription: './EventSubscription.js',
          EventSubscriptionVendor: './EventSubscriptionVendor.js',
        },
      },
      stripDEV: true,
    }),
  ],
};
