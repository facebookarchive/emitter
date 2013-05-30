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
 * @providesModule EventEmitter
 * @typechecks
 */
'use strict';

var emptyFunction = require('emptyFunction');
var invariant = require('invariant');

/**
 * @class EventEmitter
 * @description
 * An EventEmitter is responsible for managing a set of listeners and publishing
 * events to them when it is told that such events happened. In addition to the
 * data for the given event it also sends a event control object which allows
 * the listeners/handlers to prevent the default behavior of the given event.
 *
 * The emitter is designed to be generic enough to support all the different
 * contexts in which one might want to emit events. It is a simple multicast
 * mechanism on top of which extra functionality can be composed. For example, a
 * more advanced emitter may use an EventHolder and EventFactory.
 */
class EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    this._listenersByType = {};
    this._listenerContextsByType = {};
    this._currentSubscription = {};
  }

  /**
   * Adds a listener to be invoked when events of the specified type are
   * emitted. An optional calling context may be provided. The data arguments
   * emitted will be passed to the listener function.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke when the specified event is
   *   emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */
  addListener(eventType, listener, context) {
    if (!this._listenersByType[eventType]) {
      this._listenersByType[eventType] = [];
    }
    var key = this._listenersByType[eventType].length;
    this._listenersByType[eventType].push(listener);

    if (context !== undefined) {
      if (!this._listenerContextsByType[eventType]) {
        this._listenerContextsByType[eventType] = [];
      }
      this._listenerContextsByType[eventType][key] = context;
    }

    return new ListenerSubscription(this, eventType, key);
  }

  /**
   * Similar to addListener, except that the listener is removed after it is
   * invoked once.
   *
   * @param {string} eventType - Name of the event to listen to
   * @param {function} listener - Function to invoke only once when the
   *   specified event is emitted
   * @param {*} context - Optional context object to use when invoking the
   *   listener
   */
  once(eventType, listener, context) {
    var emitter = this;
    return this.addListener(eventType, function() {
      emitter.removeCurrentListener();
      listener.apply(context, arguments);
    });
  }

  /**
   * Removes all of the registered listeners, including those registered as
   * listener maps.
   *
   * @param {?string} eventType - Optional name of the event whose registered
   *   listeners to remove
   */
  removeAllListeners(eventType) {
    if (eventType === undefined) {
      this._listenersByType = {};
      this._listenerContextsByType = {};
    } else {
      delete this._listenersByType[eventType];
      delete this._listenerContextsByType[eventType];
    }
  }

  /**
   * Provides an API that can be called during an eventing cycle to remove the
   * last listener that was invoked. This allows a developer to provide an event
   * object that can remove the listener (or listener map) during the
   * invocation.
   *
   * If it is called when not inside of an emitting cycle it will throw.
   *
   * @throws {Error} When called not during an eventing cycle
   *
   * @example
   *   var subscription = emitter.addListenerMap({
   *     someEvent: function(data, event) {
   *       console.log(data);
   *       emitter.removeCurrentListener();
   *     }
   *   });
   *
   *   emitter.emit('someEvent', 'abc'); // logs 'abc'
   *   emitter.emit('someEvent', 'def'); // does not log anything
   */
  removeCurrentListener() {
    invariant(
      this._currentSubscription.key !== undefined,
      'Not in an emitting cycle; there is no current listener'
    );
    this.removeSubscription(this._currentSubscription);
  }

  /**
   * Removes a specific subscription. Instead of calling this function, call
   * `subscription.remove()` directly.
   *
   * @param {object} subscription - A subscription returned from one of this
   *   emitter's listener registration methods
   */
  removeSubscription(subscription) {
    var eventType = subscription.eventType;
    var key = subscription.key;

    var listenersOfType = this._listenersByType[eventType];
    if (listenersOfType) {
      delete listenersOfType[key];
    }

    var listenerContextsOfType = this._listenerContextsByType[eventType];
    if (listenerContextsOfType) {
      delete listenerContextsOfType[key];
    }
  }

  /**
   * Returns an array of listeners that are currently registered for the given
   * event.
   *
   * @param {string} eventType - Name of the event to query
   * @returns {array}
   */
  listeners(eventType) {
    var listenersOfType = this._listenersByType[eventType];
    return listenersOfType
      ? listenersOfType.filter(emptyFunction.thatReturnsTrue)
      : [];
  }

  /**
   * Emits an event of the given type with the given data. All handlers of that
   * particular type will be notified.
   *
   * @param {string} eventType - Name of the event to emit
   * @param {...*} Arbitrary arguments to be passed to each registered listener
   *
   * @example
   *   emitter.addListener('someEvent', function(message) {
   *     console.log(message);
   *   });
   *
   *   emitter.emit('someEvent', 'abc'); // logs 'abc'
   */
  emit(eventType, a, b, c, d, e, _) {
    invariant(
      _ === undefined,
      'EventEmitter.emit currently accepts only up to five listener arguments.'
    );

    var listeners = this._listenersByType[eventType];
    if (listeners) {
      var contexts = this._listenerContextsByType[eventType];
      this._currentSubscription.eventType = eventType;

      var keys = Object.keys(listeners);
      for (var ii = 0; ii < keys.length; ii++) {
        var key = keys[ii];
        var listener = listeners[key];

        // The listener may have been removed during this event loop.
        if (listener) {
          var context = contexts ? contexts[key] : undefined;
          this._currentSubscription.key = key;
          if (context === undefined) {
            listener(a, b, c, d, e);
          } else {
            listener.call(context, a, b, c, d, e);
          }
        }
      }

      this._currentSubscription.eventType = undefined;
      this._currentSubscription.key = undefined;
    }
  }
}

class ListenerSubscription {
  constructor(emitter, eventType, key) {
    this._emitter = emitter;
    this.eventType = eventType;
    this.key = key;
  }

  remove() {
    this._emitter.removeSubscription(this);
  }
}

module.exports = EventEmitter;
