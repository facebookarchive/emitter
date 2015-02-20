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

var EventEmitter = require('EventEmitter');

describe('EventEmitter', function() {
  it('notifies listener when told to emit an event which that listener has ' +
     'registered for', function () {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    emitter.addListener('type1', callback);

    emitter.emit('type1', 'data');

    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('allows for the passing of the context when handling events', function() {
    var emitter = new EventEmitter();
    var calledContext;
    var callback = mocks.getMockFunction();
    callback.mockImplementation(function() {
      calledContext = this;
    });
    var context = {};

    emitter.addListener('type1', callback, context);

    emitter.emit('type1', 'data');

    expect(calledContext).toBe(context);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('notifies multiple listeners when told to emit an event which multiple ' +
     'listeners are registered for', function () {
    var emitter = new EventEmitter();
    var callback1 = mocks.getMockFunction();
    var callback2 = mocks.getMockFunction();

    emitter.addListener('type1', callback1);
    emitter.addListener('type1', callback2);

    emitter.emit('type1', 'data');

    expect(callback1.mock.calls[0][0]).toBe('data');
    expect(callback2.mock.calls[0][0]).toBe('data');
  });

  it('does not notify events of different types', function() {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    emitter.addListener('type1', callback);

    emitter.emit('type2');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not notify of events after all listeners are removed', function() {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    emitter.addListener('type1', callback);
    emitter.removeAllListeners();

    emitter.emit('type1');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not notify the listener of events after it is removed', function() {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    var subscription = emitter.addListener('type1', callback);
    subscription.remove();

    emitter.emit('type1');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('invokes only the listeners registered at the time the event was ' +
     'emitted, even if more were added', function() {
    var emitter = new EventEmitter();
    var callback1 = mocks.getMockFunction();
    var callback2 = mocks.getMockFunction();

    callback1.mockImplementation(function() {
      emitter.addListener('type1', callback2);
    });

    emitter.addListener('type1', callback1);

    emitter.emit('type1');

    expect(callback1.mock.calls.length).toBe(1);
    expect(callback2.mock.calls.length).toBe(0);
  });

  it('does not invoke listeners registered at the time the event was ' +
     'emitted but later removed during the event loop', function() {
    var emitter = new EventEmitter();
    var callback1 = mocks.getMockFunction();
    var callback2 = mocks.getMockFunction();

    callback1.mockImplementation(function() {
      subscription.remove();
    });

    emitter.addListener('type1', callback1);
    var subscription = emitter.addListener('type1', callback2);

    emitter.emit('type1');

    expect(callback1.mock.calls.length).toBe(1);
    expect(callback2.mock.calls.length).toBe(0);
  });

  it('does notify other handlers of events after a particular listener has ' +
     'been removed', function() {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    var subscription = emitter.addListener('type1', function() {});
    emitter.addListener('type1', callback);
    subscription.remove();

    emitter.emit('type1', 'data');

    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('provides a way to remove the current listener when told to do so in ' +
     'the midst of an emitting cycle', function() {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    emitter.addListener('type1', callback);

    callback.mockImplementation(function(data) {
      emitter.removeCurrentListener();
    });

    emitter.emit('type1', 'data');
    emitter.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('provides a way to register a listener that is invoked once', function() {
    var emitter = new EventEmitter();
    var callback = mocks.getMockFunction();

    emitter.once('type1', callback);

    emitter.emit('type1', 'data');
    emitter.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('throws an error when told to remove the current listener when not in ' +
     'an emitting cycle', function() {
    var emitter = new EventEmitter();

    expect(function() {
      emitter.removeCurrentListener();
    }).toThrow(
      'Invariant Violation: Not in an emitting cycle; there is no current ' +
      'subscription'
    );
  });

  it('returns an array of listeners for an event', function() {
    var emitter = new EventEmitter();
    var listener1 = function() {};
    var listener2 = function() {};
    emitter.addListener('type1', listener1);
    emitter.addListener('type1', listener2);

    var listeners = emitter.listeners('type1');
    expect(listeners.length).toBe(2);
    expect(listeners).toContain(listener1);
    expect(listeners).toContain(listener2);
  });

  it('returns an empty array when there are no listeners', function() {
    var emitter = new EventEmitter();
    expect(emitter.listeners('type1').length).toBe(0);
  });

  it('returns only the listeners for the registered event', function() {
    var emitter = new EventEmitter();
    var listener1 = function() {};
    var listener2 = function() {};
    emitter.addListener('type1', listener1);
    emitter.addListener('type2', listener2);

    var listeners = emitter.listeners('type1');
    expect(listeners.length).toBe(1);
    expect(listeners).toContain(listener1);
  });

  it('does not return removed listeners', function() {
    var emitter = new EventEmitter();
    var listener1 = function() {};
    var listener2 = function() {};
    var subscription1 = emitter.addListener('type1', listener1);
    emitter.addListener('type1', listener2);
    subscription1.remove();

    var listeners = emitter.listeners('type1');
    expect(listeners.length).toBe(1);
    expect(listeners).toContain(listener2);
  });
});
