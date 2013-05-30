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
 * @emails javascript@lists.facebook.com
 */
'use strict';

require('mock-modules').autoMockOff();

var mocks = require('mocks');
var EventHolder = require('EventHolder');

describe('EventHolder', function() {
  it('emits the held event when given a handler that implements a handler ' +
     'for that event type', function() {
    var holder = new EventHolder();
    var callback = mocks.getMockFunction();

    holder.holdEvent('click', 'data');
    holder.emitToListener('click', callback);

    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('does not throw when a given a handler that does not handle one of the ' +
     'held event types', function() {
    var holder = new EventHolder();

    holder.holdEvent('click', 'data');
    expect(function() {
     holder.emitToListener('touchstart', function() {});
    }).not.toThrow();
  });

  it('emits the held events of all types a given handler supports', function() {
    var holder = new EventHolder();
    var tapCallback = mocks.getMockFunction();
    var clickCallback = mocks.getMockFunction();

    holder.holdEvent('click', 'clickData');
    holder.holdEvent('tap', 'tapData');
    holder.emitToListener('click', clickCallback);
    holder.emitToListener('tap', tapCallback);

    expect(clickCallback.mock.calls.length).toBe(1);
    expect(clickCallback.mock.calls[0][0]).toBe('clickData');

    expect(tapCallback.mock.calls.length).toBe(1);
    expect(tapCallback.mock.calls[0][0]).toBe('tapData');
  });

  it('emits multiple events of the same type when a given handler supports ' +
     'that type', function() {
    var holder = new EventHolder();
    var callback = mocks.getMockFunction();

    holder.holdEvent('click', 'data1');
    holder.holdEvent('click', 'data2');
    holder.emitToListener('click', callback);

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0]).toBe('data1');
    expect(callback.mock.calls[1][0]).toBe('data2');
  });

  it('allows the handler to specify a context in which to emit the held ' +
     'events if they want the context not to be the handler', function() {
    var holder = new EventHolder();
    var callback = jasmine.createSpy('callback');
    var context = {};

    holder.holdEvent('click', 'data');
    holder.emitToListener('click', callback, context);

    expect(callback.mostRecentCall.object).toBe(context);
  });

  it('allows for the releasing of a held event when it is in the process ' +
     'of being emitted', function() {
    var holder = new EventHolder();
    var callback = mocks.getMockFunction();

    holder.holdEvent('click', 'data');
    holder.emitToListener('click', function() {
      holder.releaseCurrentEvent();
    });
    holder.emitToListener('click', callback);

    expect(callback.mock.calls.length).toBe(0);
  });

  it('throws an error when told to release the current event when not in an ' +
     'emitting cycle', function() {
    var holder = new EventHolder();

    expect(function() {
      holder.releaseCurrentEvent();
    }).toThrow(
      'Invariant Violation: Not in an emitting cycle; there is no current event'
    );
  });

  it('allows releasing an event via the token from holdEvent', function() {
    var holder = new EventHolder();
    var token = holder.holdEvent('click', 'data');
    var callback = mocks.getMockFunction();

    holder.releaseEvent(token);
    holder.emitToListener('click', callback);

    expect(callback.mock.calls.length).toBe(0);
  });
});
