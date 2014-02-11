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
    var callback = mocks.getMockFunction();

    emitter.emitAndHold('type1', 'data');
    emitter.addRetroactiveListener('type1', callback);

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('should handle normal events in addition to held events when a ' +
     'retroactive listener is registered', function() {
    var emitter = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    emitter.addRetroactiveListener('type1', callback);
    emitter.emit('type1', 'data');

    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe('data');
  });

  it('does not receive events that were previously emitted in a normal way ' +
     'when told to handleHeld', function() {
    var emitter = new EventEmitterRole();
    var callback = mocks.getMockFunction();

    emitter.emit('type1', 'data');
    emitter.addRetroactiveListener('type1', callback);

    expect(callback.mock.calls.length).toBe(0);
  });

  it('allows a listener to release a held event even when it is a ' +
     'retroactive listener, which means that no future retroactive listener ' +
     'will receive that held event', function() {
    var emitter = new EventEmitterRole();
    var normalCallback = mocks.getMockFunction();
    var releaseCallback = mocks.getMockFunction();
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
    var callback = mocks.getMockFunction();
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
    var callback = mocks.getMockFunction();

    emitter.addRetroactiveListener('type1', function() {
      emitter.releaseCurrentEvent();
    });
    emitter.emitAndHold('type1');

    emitter.addRetroactiveListener('type1', callback);

    expect(callback.mock.calls.length).toBe(0);
  });
});
