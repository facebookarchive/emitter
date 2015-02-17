/**
 * Copyright 2004-present Facebook. All Rights Reserved.
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
 * @emails javascript@lists.facebook.com
 */
'use strict';

require('mock-modules').autoMockOff();

var EventSubscriptionVendor = require('EventSubscriptionVendor');
var EventSubscription = require('EventSubscription');

describe('EventSubscriptionVendor', function() {

  it('adds subscriptions', function() {
    var subscriber = new EventSubscriptionVendor();
    expect(subscriber.getSubscriptionsForType('type1')).toBe(undefined);
    subscriber.addSubscription('type1', new EventSubscription(subscriber));
    expect(subscriber.getSubscriptionsForType('type1').length).toBe(1);
  });

  it('adds subscriptions keyed on type', function() {
    var subscriber = new EventSubscriptionVendor();
    subscriber.addSubscription('type1', new EventSubscription(subscriber));
    subscriber.addSubscription('type2', new EventSubscription(subscriber));
    expect(subscriber.getSubscriptionsForType('type1').length).toBe(1);
  });

  it('removes a subscription', function() {
    var subscriber = new EventSubscriptionVendor();
    var subscription1 = new EventSubscription(subscriber);
    subscription1.is1 = true;
    subscriber.addSubscription('type1', subscription1);
    var subscription2 = new EventSubscription(subscriber);
    subscription2.is1 = false;
    subscriber.addSubscription('type1', subscription2);
    expect(subscriber.getSubscriptionsForType('type1').length).toBe(2);
    subscriber.removeSubscription(subscription1);
    var subscriptions = subscriber.getSubscriptionsForType('type1');
    var allempty = true;
    for (var key in subscriptions) {
      if (subscriptions[key]) {
        allempty = false;
        expect(subscriptions[key].is1).toBeFalsy();
      }
    }
    expect(allempty).toBeFalsy();
  });

  it('removes all subscriptions of a certain type', function() {
    var subscriber = new EventSubscriptionVendor();
    subscriber.addSubscription('type1', new EventSubscription(subscriber));
    subscriber.addSubscription('type1', new EventSubscription(subscriber));
    expect(subscriber.getSubscriptionsForType('type1').length).toBe(2);
    subscriber.removeAllSubscriptions('type1');
    expect(subscriber.getSubscriptionsForType('type1'))
      .toBe(undefined);
  });
});
