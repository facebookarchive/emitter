/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EventSubscription
 * @flow
 */

'use strict';

import type EventSubscriptionVendor from 'EventSubscriptionVendor';

/**
 * EventSubscription represents a subscription to a particular event. It can
 * remove its own subscription.
 */
class EventSubscription {
  subscriber: EventSubscriptionVendor;

  /**
   * @param {EventSubscriptionVendor} subscriber the subscriber that controls
   *   this subscription.
   */
  constructor(subscriber: EventSubscriptionVendor): void {
    this.subscriber = subscriber;
  }

  /**
   * Removes this subscription from the subscriber that controls it.
   */
  remove(): void {
    if (this.subscriber) {
      this.subscriber.removeSubscription(this);
      this.subscriber = null;
    }
  }
}

module.exports = EventSubscription;
