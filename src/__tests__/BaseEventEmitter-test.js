/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.autoMockOff();

var BaseEventEmitter = require('BaseEventEmitter');

describe('BaseEventEmitter', function() {
  it('notifies listener when told to emit an event which that listener has ' +
     'registered for', function () {
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

    emitter.addListener('type1', callback);

    emitter.emit('type1', 'data');

    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('allows for the passing of the context when handling events', function() {
    var emitter = new BaseEventEmitter();
    var calledContext;
    var callback = jest.genMockFunction();
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
    var emitter = new BaseEventEmitter();
    var callback1 = jest.genMockFunction();
    var callback2 = jest.genMockFunction();

    emitter.addListener('type1', callback1);
    emitter.addListener('type1', callback2);

    emitter.emit('type1', 'data');

    expect(callback1.mock.calls[0][0]).toBe('data');
    expect(callback2.mock.calls[0][0]).toBe('data');
  });

  it('does not notify events of different types', function() {
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

    emitter.addListener('type1', callback);

    emitter.emit('type2');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not notify of events after all listeners are removed', function() {
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

    emitter.addListener('type1', callback);
    emitter.removeAllListeners();

    emitter.emit('type1');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not notify the listener of events after it is removed', function() {
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

    var subscription = emitter.addListener('type1', callback);
    subscription.remove();

    emitter.emit('type1');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('invokes only the listeners registered at the time the event was ' +
     'emitted, even if more were added', function() {
    var emitter = new BaseEventEmitter();
    var callback1 = jest.genMockFunction();
    var callback2 = jest.genMockFunction();

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
    var emitter = new BaseEventEmitter();
    var callback1 = jest.genMockFunction();
    var callback2 = jest.genMockFunction();

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
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

    var subscription = emitter.addListener('type1', function() {});
    emitter.addListener('type1', callback);
    subscription.remove();

    emitter.emit('type1', 'data');

    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('provides a way to remove the current listener when told to do so in ' +
     'the midst of an emitting cycle', function() {
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

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
    var emitter = new BaseEventEmitter();
    var callback = jest.genMockFunction();

    emitter.once('type1', callback);

    emitter.emit('type1', 'data');
    emitter.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('throws an error when told to remove the current listener when not in ' +
     'an emitting cycle', function() {
    var emitter = new BaseEventEmitter();

    expect(function() {
      emitter.removeCurrentListener();
    }).toThrow('Not in an emitting cycle; there is no current subscription');
  });

  it('returns an array of listeners for an event', function() {
    var emitter = new BaseEventEmitter();
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
    var emitter = new BaseEventEmitter();
    expect(emitter.listeners('type1').length).toBe(0);
  });

  it('returns only the listeners for the registered event', function() {
    var emitter = new BaseEventEmitter();
    var listener1 = function() {};
    var listener2 = function() {};
    emitter.addListener('type1', listener1);
    emitter.addListener('type2', listener2);

    var listeners = emitter.listeners('type1');
    expect(listeners.length).toBe(1);
    expect(listeners).toContain(listener1);
  });

  it('does not return removed listeners', function() {
    var emitter = new BaseEventEmitter();
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
