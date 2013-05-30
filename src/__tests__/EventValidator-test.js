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
var EventValidator = require('EventValidator');

describe('EventValidator', function() {
  it('throws an error when attempting to emit an event that was not ' +
     'commissioned with the emitter', function() {
    var emitter = new EventEmitter();
    emitter = EventValidator.addValidation(emitter, {something: true});

    expect(function() {
      emitter.emit('another', 'data');
    }).toThrow('Unknown event type "another". Known event types: something.');
  });

  it('delegates to its event emitter', function() {
    var delegate = new EventEmitter();
    delegate.emit = mocks.getMockFunction();
    var emitter = EventValidator.addValidation(delegate, {something: true});

    emitter.emit('something', 'data1', 'data2');
    expect(delegate.emit.mock.calls.length).toBe(1);
    expect(delegate.emit.mock.calls[0][0]).toBe('something');
    expect(delegate.emit.mock.calls[0][1]).toBe('data1');
    expect(delegate.emit.mock.calls[0][2]).toBe('data2');
  });

  describe('when in development mode', function() {
    beforeEach(function() {
      window.__DEV__ = true;
    });

    it('provides a more descriptive error message when it thinks that you ' +
       'have likely mistyped the event name', function() {
      var emitter = new EventEmitter();
      emitter = EventValidator.addValidation(emitter, {honk: true});

      expect(function() {
        emitter.emit('bonk', 'data');
      }).toThrow('Unknown event type "bonk". Did you mean "honk"? ' +
                 'Known event types: honk.');
    });

    it('provides the most likely event name when it thinks that the emitted  ' +
       'event is likely mistyped', function() {
      var emitter = new EventEmitter();
      emitter = EventValidator.addValidation(emitter, {
        honky: true,
        honk: true
      });

      expect(function() {
        emitter.emit('bonk', 'data');
      }).toThrow('Unknown event type "bonk". Did you mean "honk"? ' +
                 'Known event types: honky, honk.');
    });
  });
});
