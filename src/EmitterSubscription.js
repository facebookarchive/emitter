/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule EmitterSubscription
 * @typechecks
 */

'use strict';

var EventSubscription = require('EventSubscription');

/**
 * EmitterSubscription represents a subscription with listener and context data.
 */
class EmitterSubscription extends EventSubscription {

  /**
   * @param {EventSubscriptionVendor} subscriber - The subscriber that controls
   *   this subscription
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */
  constructor(subscriber: EventSubscriptionVendor, listener, context: ?Object) {
    super(subscriber);
    this.listener = listener;
    this.context = context;
  }
}

module.exports = EmitterSubscription;
