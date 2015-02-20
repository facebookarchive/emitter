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

jest.autoMockOff();

var EventEmitter = require('EventEmitter');
var EventEmitterWithHolding = require('EventEmitterWithHolding');
var EventHolder = require('EventHolder');

var copyProperties = require('copyProperties');

function EventEmitterRole() {
  var emitter = new EventEmitter();
  var holder = new EventHolder();
  EventEmitterWithHolding.call(this, emitter, holder);
}
copyProperties(EventEmitterRole.prototype, EventEmitterWithHolding.prototype, {
  constructor: EventEmitterRole
});

describe('EventEmitterWithHolding', function() {

  it('should handle held events', function() {
    var emitter = new EventEmitterRole();
    var callback = jest.genMockFunction();

    emitter.emitAndHold('type1', 'data');
    emitter.addRetroactiveListener('type1', callback);

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('should handle normal events in addition to held events when a ' +
     'retroactive listener is registered', function() {
    var emitter = new EventEmitterRole();
    var callback = jest.genMockFunction();

    emitter.addRetroactiveListener('type1', callback);
    emitter.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('does not receive events that were previously emitted in a normal way ' +
     'when told to handleHeld', function() {
    var emitter = new EventEmitterRole();
    var callback = jest.genMockFunction();

    emitter.emit('type1', 'data');
    emitter.addRetroactiveListener('type1', callback);

    expect(callback.mock.calls.length).toBe(0);
  });

  it('allows a listener to release a held event even when it is a ' +
     'retroactive listener, which means that no future retroactive listener ' +
     'will receive that held event', function() {
    var emitter = new EventEmitterRole();
    var normalCallback = jest.genMockFunction();
    var releaseCallback = jest.genMockFunction();
    releaseCallback.mockImplementation(function() {
      emitter.releaseCurrentEvent();
    });
    emitter.emitAndHold('type1');

    emitter.addRetroactiveListener('type1', releaseCallback);
    emitter.addRetroactiveListener('type1', normalCallback);

    expect(normalCallback.mock.calls.length).toBe(0);
  });

  it('allows a listener to still receive events when it is a retroactive ' +
     'listener and it releases a held event', function() {
    var emitter = new EventEmitterRole();
    var callback = jest.genMockFunction();
    callback.mockImplementation(function(data) {
      emitter.releaseCurrentEvent();
    });
    emitter.emitAndHold('type1', 'data1');

    emitter.addRetroactiveListener('type1', callback);
    emitter.emit('type1', 'data2');

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0]).toBe('data1');
    expect(callback.mock.calls[1][0]).toBe('data2');
  });

  it('allows a listener to release a current event, preventing it from being ' +
     'held', function() {
    var emitter = new EventEmitterRole();
    var callback = jest.genMockFunction();

    emitter.addRetroactiveListener('type1', function() {
      emitter.releaseCurrentEvent();
    });
    emitter.emit('type1');

    emitter.addRetroactiveListener('type1', callback);

    expect(callback.mock.calls.length).toBe(0);
  });

  it('allows an EventEmitter to release all held events of a certain type',
      function() {
    var emitter = new EventEmitterRole();
    var callback1 = jest.genMockFunction();
    var callback2 = jest.genMockFunction();

    emitter.emitAndHold('type1');
    emitter.addRetroactiveListener('type1', callback1);

    emitter.releaseHeldEventType('type1');
    emitter.emitAndHold('type1');
    emitter.addRetroactiveListener('type1', callback2);

    expect(callback1.mock.calls.length).toBe(2);
    expect(callback2.mock.calls.length).toBe(1);
  });

  it('allows a listener to remove the current listener', function() {
    var emitter = new EventEmitterRole();
    var callback = jest.genMockFunction().mockImplementation(function() {
      emitter.removeCurrentListener();
    });

    emitter.emitAndHold('type');
    emitter.addRetroactiveListener('type', callback);
    expect(callback.mock.calls.length).toBe(1);

    emitter.emitAndHold('type');
    expect(callback.mock.calls.length).toBe(1);
  });

  it('can handle nested subscriptions to held events', function() {
    var emitter = new EventEmitterRole();
    var callback1 = jest.genMockFunction();
    var callback2 = jest.genMockFunction();
    var callback3 = jest.genMockFunction();
    var callback4 = jest.genMockFunction();
    var callback5 = jest.genMockFunction();
    var callback6 = jest.genMockFunction();

    emitter.emitAndHold('type1');
    emitter.emitAndHold('type2');
    emitter.emitAndHold('type3');

    callback1.mockImplementation(function() {
      emitter.addRetroactiveListener('type2', callback2);
      // should release type1
      emitter.releaseCurrentEvent();
      emitter.removeCurrentListener();
    });

    callback2.mockImplementation(function() {
      emitter.addRetroactiveListener('type3', callback3);
      // should relase type2
      emitter.releaseCurrentEvent();
      emitter.removeCurrentListener();
    });

    emitter.addRetroactiveListener('type1', callback1);
    expect(callback1.mock.calls.length).toBe(1);
    expect(callback2.mock.calls.length).toBe(1);
    expect(callback3.mock.calls.length).toBe(1);
    // type1 and type2 should have been released now
    // event3 should still be around

    emitter.emit('type1');
    emitter.emit('type2');
    emitter.emit('type3');
    expect(callback1.mock.calls.length).toBe(1);
    expect(callback2.mock.calls.length).toBe(1);
    expect(callback3.mock.calls.length).toBe(2);

    emitter.addRetroactiveListener('type1', callback4);
    emitter.addRetroactiveListener('type2', callback5);
    emitter.addRetroactiveListener('type3', callback6);
    expect(callback4).not.toBeCalled();
    expect(callback5).not.toBeCalled();
    expect(callback6.mock.calls.length).toBe(1);
  });
});
