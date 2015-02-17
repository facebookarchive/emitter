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
 * @providesModule mixInEventEmitter
 */
'use strict';

var EventEmitterWithHolding = require('EventEmitterWithHolding');
var EventEmitterWithValidation = require('EventEmitterWithValidation');
var EventHolder = require('EventHolder');

var invariant = require('invariant');
var objectAssign = require('object-assign');

/**
 * API to setup an object or constructor to be able to emit data events.
 *
 * @example
 * function Dog() { ...dog stuff... }
 * mixInEventEmitter(Dog, {bark: true});
 *
 * var puppy = new Dog();
 * puppy.addListener('bark', function (volume) {
 *   console.log('Puppy', this, 'barked at volume:', volume);
 * });
 * puppy.emit('bark', 'quiet');
 * // Puppy <puppy> barked at volume: quiet
 *
 *
 * // A "singleton" object may also be commissioned:
 *
 * var Singleton = {};
 * mixInEventEmitter(Singleton, {lonely: true});
 * Singleton.emit('lonely', true);
 */
function mixInEventEmitter(klass, types) {
  invariant(types, 'Must supply set of valid event types');

  // If this is a constructor, write to the prototype, otherwise write to the
  // singleton object.
  var target = klass.prototype || klass;
  invariant(!target.__eventEmitter, 'An active emitter is already mixed in');

  var ctor = klass.constructor;
  if (ctor) {
    invariant(
      ctor === Object || ctor === Function,
      'Mix EventEmitter into a class, not an instance'
    );
  }

  // Keep track of the provided types. Union any types that already exist so
  // that prototypical subclasses can provide more types.
  target.__types = objectAssign(target.__types || {}, types);
  target = objectAssign(target, EventEmitterMixin);
}

var EventEmitterMixin = {
  emit: function(eventType, a, b, c, d, e, _) {
    return this.__getEventEmitter().emit(eventType, a, b, c, d, e, _);
  },

  emitAndHold: function(eventType, a, b, c, d, e, _) {
    return this.__getEventEmitter().emitAndHold(eventType, a, b, c, d, e, _);
  },

  addListener: function(eventType, listener, context) {
    return this.__getEventEmitter().addListener(eventType, listener, context);
  },

  once: function(eventType, listener, context) {
    return this.__getEventEmitter().once(eventType, listener, context);
  },

  addRetroactiveListener: function(eventType, listener, context) {
    return this.__getEventEmitter().addRetroactiveListener(
      eventType,
      listener,
      context
    );
  },

  addListenerMap: function(listenerMap, context) {
    return this.__getEventEmitter().addListenerMap(listenerMap, context);
  },

  addRetroactiveListenerMap: function(listenerMap, context) {
    return this.__getEventEmitter().addListenerMap(listenerMap, context);
  },

  listeners: function(eventType) {
    return this.__getEventEmitter().listeners(eventType);
  },

  removeAllListeners: function() {
    this.__getEventEmitter().removeAllListeners();
  },

  removeCurrentListener: function() {
    this.__getEventEmitter().removeCurrentListener();
  },

  releaseHeldEventType: function(eventType) {
    this.__getEventEmitter().releaseHeldEventType(eventType);
  },

  __getEventEmitter: function() {
    if (!this.__eventEmitter) {
      var emitter = new EventEmitterWithValidation(this.__types);
      var holder = new EventHolder();
      this.__eventEmitter = new EventEmitterWithHolding(emitter, holder);
    }
    return this.__eventEmitter;
  }
};

module.exports = mixInEventEmitter;
