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

var mocks = require('mocks');
var mixInEventEmitter = require('mixInEventEmitter');

describe('mixInEventEmitter', function() {
  it('throws an error when attempting to mix into a class\'s ' +
     'prototype', function() {
    expect(function() {
      function Class() {}
      mixInEventEmitter(Class.prototype, {type: true});
    }).toThrow(
      'Invariant Violation: Mix EventEmitter into a class, not an instance'
    );
  });

  it('throws an error when attempting to mix into a class\'s ' +
     'instance', function() {
    expect(function() {
      function Class() {}
      var instance = new Class();
      mixInEventEmitter(instance, {type: true});
    }).toThrow(
      'Invariant Violation: Mix EventEmitter into a class, not an instance'
    );
  });

  it('allows mixing into a singleton object', function() {
    var Singleton = {};
    mixInEventEmitter(Singleton, {type: true});

    var callback = mocks.getMockFunction();

    Singleton.addListener('type', callback);
    Singleton.emit('type', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('continues being able to emit events from a first mixing-in even after ' +
     'a second mixing-in', function() {
    function Class() {}
    mixInEventEmitter(Class, {type1: true});

    var instance = new Class();
    var callback = mocks.getMockFunction();
    instance.addListener('type1', callback);

    mixInEventEmitter(Class, {type2: true});

    instance.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('a second mixing-in even after instances are created', function() {
    function Class() {}
    mixInEventEmitter(Class, {type1: true});

    var instance = new Class();

    mixInEventEmitter(Class, {type2: true});
    var callback = mocks.getMockFunction();
    instance.addListener('type2', callback);

    instance.emit('type2', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
      expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');});

  it('allows using subclasses', function() {
    function Class() {}
    mixInEventEmitter(Class, {type1: true});

    class Subclass extends Class {}

    var subclassInstance = new Subclass();
    var callback = mocks.getMockFunction();
    subclassInstance.addListener('type1', callback);
    subclassInstance.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('allows a subclass to commission further events', function() {
    function Class() {}
    mixInEventEmitter(Class, {type1: true});

    class Subclass extends Class {}
    mixInEventEmitter(Subclass, {type2: true});

    var subclassInstance = new Subclass();
    var callback = mocks.getMockFunction();
    subclassInstance.addListener('type2', callback);

    subclassInstance.emit('type2', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('allows a subclass commissioned with its own events to still fire its ' +
     'parent\'s events', function() {
    function Class() {}
    mixInEventEmitter(Class, {type1: true});

    class Subclass extends Class {}
    mixInEventEmitter(Subclass, {type2: true});

    var subclassInstance = new Subclass();
    var callback = mocks.getMockFunction();
    subclassInstance.addListener('type1', callback);

    expect(function() {
      subclassInstance.emit('type1', 'data');
    }).not.toThrow();

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });
});

describe('Mixed-in EventEmitter', function() {
  it('throws when emitting an unknown type', function() {
    function Truck() {}
    mixInEventEmitter(Truck, {honk: true});

    var tonka = new Truck();

    expect(function() {
      tonka.emit('quack');
    }).toThrow('Unknown event type "quack". Known event types: honk.');
  });

  it('provides a more descriptive error message when it thinks that you have ' +
     'likely mistyped the event name', function() {
    function Truck() {}
    mixInEventEmitter(Truck, {vroom: true});

    var tonka = new Truck();

    expect(function() {
      tonka.emit('vrooom');
    }).toThrow(
      'Unknown event type "vrooom". Did you mean "vroom"?'+
      ' Known event types: vroom.'
    );
  });

  it('throws when emitting and holding an unknown type', function() {
    function Truck() {}
    mixInEventEmitter(Truck, {vroom: true});

    var tonka = new Truck();

    expect(function() {
      tonka.emitAndHold('quack');
    }).toThrow('Unknown event type "quack". Known event types: vroom.');
  });

  it('provides a more descriptive error message when it thinks that you have ' +
     'likely mistyped the event name when emitting and holding', function() {
    function Truck() {}
    mixInEventEmitter(Truck, {vroom: true});

    var tonka = new Truck();

    expect(function() {
      tonka.emitAndHold('vrooom');
    }).toThrow(
      'Unknown event type "vrooom". Did you mean "vroom"?'+
      ' Known event types: vroom.'
    );
  });
});

// These are mostly legacy tests which test the system end-to-end
describe('EventEmitter instances', function() {

  // Used for testing in a few specs
  function EventEmitterRole() {}
  mixInEventEmitter(EventEmitterRole, {
    type1: true,
    type2: true
  });

  it('should call listeners', function() {
    var instance1 = new EventEmitterRole();
    var instance2 = new EventEmitterRole();

    var callback1_1 = mocks.getMockFunction();
    var callback1_2 = mocks.getMockFunction();
    var callback2_1 = mocks.getMockFunction();
    var callback2_2 = mocks.getMockFunction();

    instance1.addListener('type1', callback1_1);
    instance1.addListener('type2', callback1_2);
    instance2.addListener('type1', callback2_1);
    instance2.addListener('type2', callback2_2);

    instance1.emit('type1', 'data1_1');
    instance1.emit('type2', 'data1_2');
    instance2.emit('type1', 'data2_1');
    instance2.emit('type2', 'data2_2');

    expect(callback1_1.mock.calls.length).toBe(1);
    expect(callback1_1.mock.calls[0][0]).toBe('data1_1');
    expect(callback1_2.mock.calls.length).toBe(1);
    expect(callback1_2.mock.calls[0][0]).toBe('data1_2');
    expect(callback2_1.mock.calls.length).toBe(1);
    expect(callback2_1.mock.calls[0][0]).toBe('data2_1');
    expect(callback2_2.mock.calls.length).toBe(1);
    expect(callback2_2.mock.calls[0][0]).toBe('data2_2');
  });

  it('should allow more than one listener', function() {
    var instance1 = new EventEmitterRole();

    var callback1 = mocks.getMockFunction();
    var callback2 = mocks.getMockFunction();
    var callback3 = mocks.getMockFunction();

    instance1.addListener('type1', callback1);
    instance1.addListener('type1', callback2);
    instance1.addListener('type1', callback3);

    instance1.emit('type1', 'data1');

    expect(callback1.mock.calls[0][0]).toBe('data1');
    expect(callback2.mock.calls[0][0]).toBe('data1');
    expect(callback3.mock.calls[0][0]).toBe('data1');
  });

  it('should handle more than one event', function() {
    var instance = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    instance.addListener('type1', callback);

    instance.emit('type1', 'data1');
    instance.emit('type1', 'data2');

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0]).toBe('data1');
    expect(callback.mock.calls[1][0]).toBe('data2');
  });

  it('does not send the event when the listener has been removed', function() {
    var instance = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    var subscription = instance.addListener('type1', callback);
    subscription.remove();
    instance.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not send the event when multiple listeners are registered and ' +
     'then removed', function() {
    var instance = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    var subscription1 = instance.addListener('type1', callback);
    var subscription2 = instance.addListener('type2', callback);
    subscription1.remove();
    subscription2.remove();
    instance.emit('type1', 'data');
    instance.emit('type2', 'data');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('allows the removing of the listener via the emitter', function() {
    var instance = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    instance.addListener('type1', callback);
    callback.mockImplementation(function() {
      instance.removeCurrentListener();
    });

    instance.emit('type1');
    expect(callback.mock.calls.length).toBe(1);
    instance.emit('type1');
    expect(callback.mock.calls.length).toBe(1);
  });

  it('does not remove other listeners when a listener is removed via the ' +
     'emitter', function() {
    var instance = new EventEmitterRole();

    var callbackWithRemove = mocks.getMockFunction();
    var callbackNoRemove = mocks.getMockFunction();

    // This assumes that the listeners are invoked in order of registration.
    instance.addListener('type1', callbackWithRemove);
    instance.addListener('type1', callbackNoRemove);

    callbackWithRemove.mockImplementation(function() {
      instance.removeCurrentListener();
    });

    instance.emit('type1');
    instance.emit('type1');

    expect(callbackWithRemove.mock.calls.length).toBe(1);
    expect(callbackNoRemove.mock.calls.length).toBe(2);
  });

  it('should not handle anything after removing all listeners', function() {
    var instance = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    instance.addListener('type1', callback);
    instance.removeAllListeners();

    instance.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(0);
  });

  it('should still be allowed to add listeners after they all have been ' +
     'removed', function() {
    var instance = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    instance.addListener('type1', callback);
    instance.removeAllListeners();
    instance.emit('type1', 'data1');
    instance.addListener('type1', callback);
    instance.emit('type1', 'data2');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data2');
  });

  it('returns nothing from emit', function() {
    var instance = new EventEmitterRole();
    expect(instance.emit('type1')).toBeUndefined();
  });

  it('allows an mixInEventEmitter to release all held events of a certain type',
      function() {
    var emitter = new EventEmitterRole();
    var callback1 = mocks.getMockFunction();
    var callback2 = mocks.getMockFunction();

    emitter.emitAndHold('type1');
    emitter.addRetroactiveListener('type1', callback1);

    emitter.releaseHeldEventType('type1');
    emitter.emitAndHold('type1');
    emitter.addRetroactiveListener('type1', callback2);

    expect(callback1.mock.calls.length).toBe(2);
    expect(callback2.mock.calls.length).toBe(1);
  });
});
