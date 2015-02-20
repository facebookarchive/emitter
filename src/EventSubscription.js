/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule EventSubscription
 * @typechecks
 */
'use strict';

/**
 * EventSubscription represents a subscription to a particular event. It can
 * remove its own subscription.
 */
class EventSubscription {

  /**
   * @param {EventSubscriptionVendor} subscriber the subscriber that controls
   *   this subscription.
   */
  constructor(subscriber: EventSubscriptionVendor) {
    this.subscriber = subscriber;
  }

  /**
   * Removes this subscription from the subscriber that controls it.
   */
  remove() {
    this.subscriber.removeSubscription(this);
  }
}

module.exports = EventSubscription;
