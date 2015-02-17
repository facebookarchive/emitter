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
 * @providesModule EventEmitterWithHolding
 * @typechecks
 */
'use strict';

/**
 * @class EventEmitterWithHolding
 * @description
 * An EventEmitterWithHolding decorates an event emitter and enables one to
 * "hold" or cache events and then have a handler register later to actually
 * handle them.
 *
 * This is separated into its own decorator so that only those who want to use
 * the holding functionality have to and others can just use an emitter. Since
 * it implements the emitter interface it can also be combined with anything
 * that uses an emitter.
 */
class EventEmitterWithHolding {
  /**
   * @constructor
   * @param {object} emitter - The object responsible for emitting the actual
   *   events.
   * @param {object} holder - The event holder that is responsible for holding
   *   and then emitting held events.
   */
  constructor(emitter, holder) {
    this._emitter = emitter;
    this._eventHolder = holder;
    this._currentEventToken = null;
    this._heldEventsRemovalStack = [];
    this._heldEventsEmitDepth = 0;
  }

  /**
   * @see EventEmitter#addListener
   */
  addListener(eventType: String, listener, context: ?Object) {
    return this._emitter.addListener(eventType, listener, context);
  }

  /**
   * @see EventEmitter#once
   */
  once(eventType: String, listener, context: ?Object) {
    return this._emitter.once(eventType, listener, context);
  }

  /**
   * Adds a listener to be invoked when events of the specified type are
   * emitted. An optional calling context may be provided. The data arguments
   * emitted will be passed to the listener function. In addition to subscribing
   * to all subsequent events, this method will also handle any events that have
   * already been emitted, held, and not released.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   *
   * @example
   *   emitter.emitAndHold('someEvent', 'abc');
   *
   *   emitter.addRetroactiveListener('someEvent', function(message) {
   *     console.log(message);
   *   }); // logs 'abc'
   */
  addRetroactiveListener(
    eventType: String, listener, context: ?Object): EmitterSubscription {
    var subscription = this._emitter.addListener(eventType, listener, context);

    var removeListenerStack = this._heldEventsRemovalStack;
    removeListenerStack.push(false);
    this._heldEventsEmitDepth++;
    this._eventHolder.emitToListener(eventType, listener, context);
    this._heldEventsEmitDepth--;

    if (removeListenerStack[removeListenerStack.length - 1]) {
      subscription.remove();
    }
    removeListenerStack.pop();

    return subscription;
  }

  /**
   * @see EventEmitter#removeAllListeners
   */
  removeAllListeners(eventType: String) {
    this._emitter.removeAllListeners(eventType);
  }

  /**
   * @see EventEmitter#removeCurrentListener
   */
  removeCurrentListener() {
    if (this._heldEventsEmitDepth) {
      var removeListenerStack = this._heldEventsRemovalStack;
      removeListenerStack[removeListenerStack.length - 1] = true;
    } else {
      this._emitter.removeCurrentListener();
    }
  }

  /**
   * @see EventEmitter#listeners
   */
  listeners(eventType: String) /* TODO: Annotate return type here */ {
    return this._emitter.listeners(eventType);
  }

  /**
   * @see EventEmitter#emit
   */
  emit(eventType: String, a, b, c, d, e, _) {
    this._emitter.emit(eventType, a, b, c, d, e, _);
  }

  /**
   * Emits an event of the given type with the given data, and holds that event
   * in order to be able to dispatch it to a later subscriber when they say they
   * want to handle held events.
   *
   * @param {string} eventType - Name of the event to emit
   * @param {...*} Arbitrary arguments to be passed to each registered listener
   *
   * @example
   *   emitter.emitAndHold('someEvent', 'abc');
   *
   *   emitter.addRetroactiveListener('someEvent', function(message) {
   *     console.log(message);
   *   }); // logs 'abc'
   */
  emitAndHold(eventType: String, a, b, c, d, e, _) {
    this._currentEventToken = this._eventHolder.holdEvent(
      eventType,
      a, b, c, d, e, _
    );
    this._emitter.emit(eventType, a, b, c, d, e, _);
    this._currentEventToken = null;
  }

  /**
   * @see EventHolder#releaseCurrentEvent
   */
  releaseCurrentEvent() {
    if (this._currentEventToken !== null) {
      this._eventHolder.releaseEvent(this._currentEventToken);
    } else if (!!this._heldEventsEmitDepth) {
      this._eventHolder.releaseCurrentEvent();
    }
  }

  /**
   * @see EventHolder#releaseEventType
   * @param {string} eventType
   */
  releaseHeldEventType(eventType: String) {
    this._eventHolder.releaseEventType(eventType);
  }
}

module.exports = EventEmitterWithHolding;
