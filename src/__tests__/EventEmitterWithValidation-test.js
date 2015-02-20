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

jest.dontMock('EventEmitterWithValidation');

describe('EventEmitterWithValidation', () => {
  var EventEmitter;
  var EventEmitterWithValidation;

  beforeEach(() => {
    jest.resetModuleRegistry();

    EventEmitter = require('EventEmitter');
    EventEmitterWithValidation = require('EventEmitterWithValidation');
  });

  it('throws when attempting to emit an invalid event type', () => {
    var emitter = new EventEmitterWithValidation({foo: true});

    expect(() => {
      emitter.emit('bar');
    }).toThrow('Unknown event type "bar". Known event types: foo.');
  });

  it('delegates to an internal event emitter', () => {
    var emitter = new EventEmitterWithValidation({foo: true});
    var delegate = EventEmitter.mock.instances[0];

    emitter.emit('foo', 'data1', 'data2');

    expect(delegate.emit.mock.calls).toEqual([
      ['foo', 'data1', 'data2']
    ]);
  });

  describe('development mode', () => {
    beforeEach(() => {
      window.__DEV__ = true;
    });

    it('suggests corrections for mistyped event names', () => {
      var emitter = new EventEmitterWithValidation({honk: true});

      expect(() => {
        emitter.emit('bonk', 'data');
      }).toThrow(
        'Unknown event type "bonk". Did you mean "honk"? ' +
        'Known event types: honk.'
      );
    });

    it('suggests the most likely event name when mistyped', () => {
      var emitter = new EventEmitterWithValidation({
        honky: true,
        honk: true
      });

      expect(() => {
        emitter.emit('bonk', 'data');
      }).toThrow(
        'Unknown event type "bonk". Did you mean "honk"? ' +
        'Known event types: honky, honk.'
      );
    });
  });
});
