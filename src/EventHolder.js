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
 * @providesModule EventHolder
 * @typechecks
 */
'use strict';

var invariant = require('invariant');

class EventHolder {
  constructor() {
    this._heldEvents = [];
    this._eventsToRemove = [];
    this._currentEventKey = null;
  }

  /**
   * Holds a given event for processing later.
   *
   * @param {string} eventType - Name of the event to hold and later emit
   * @param {...*} Arbitrary arguments to be passed to each registered listener
   * @return {*} Token that can be used to release the held event
   *
   * @example
   *
   *   holder.holdEvent({someEvent: 'abc'});
   *
   *   holder.emitToHandler({
   *     someEvent: function(data, event) {
   *       console.log(data);
   *     }
   *   }); //logs 'abc'
   *
   */
  holdEvent(eventType, a, b, c, d, e, _) {
    var key = this._heldEvents.length;
    var event = [eventType, a, b, c, d, e, _];
    this._heldEvents.push(event);
    return key;
  }

  /**
   * Emits the held events of the specified type to the given listener.
   *
   * NOTE: It might be necessary in the future to store the held events
   * according to type so that we do not need to loop over all possible events
   * when we know that a handler can not handle this. However this would only be
   * an optimization when there were a large number of events, and it seems that
   * most cases where you would want to "hold" an event there would be a small
   * amount of them. If this is proved to be otherwise we should trade space for
   * time. This is also harder to implement if the order of events matters.
   *
   * @param {?string} eventType - Optional name of the events to replay
   * @param {function} listener - The listener to which to dispatch the event
   * @param {?object} context - Optional context object to use when invoking
   *   the listener
   */
  emitToListener(eventType, listener, context) {
    this.forEachHeldEvent(function(type, a, b, c, d, e, _) {
      if (type === eventType) {
        listener.call(context, a, b, c, d, e, _);
      }
    });
  }

  /**
   * Synchronously iterates over all of the events held by this holder,
   * optionally filtering by an event type.
   *
   * @param {function} callback - The callback to which to dispatch the event.
   *   It should accept the event type as the first argument and arbitrary
   *   event data as the remaining arguments.
   * @param {?object} context - Optional context object to use when invoking
   *   the listener
   */
  forEachHeldEvent(callback, context) {
    this._heldEvents.forEach(function(event, key) {
      this._currentEventKey = key;
      callback.apply(context, event);
    }, this);
    this._currentEventKey = null;
  }

  /**
   * Provides an API that can be called during an eventing cycle to release
   * the last event that was invoked, so that it is no longer "held".
   *
   * If it is called when not inside of an emitting cycle it will throw.
   *
   * @throws {Error} When called not during an eventing cycle
   */
  releaseCurrentEvent() {
    invariant(
      this._currentEventKey !== null,
      'Not in an emitting cycle; there is no current event'
    );
    delete this._heldEvents[this._currentEventKey];
  }

  /**
   * Releases the event corresponding to the handle that was returned when the
   * event was first held.
   *
   * @param {*} token - The token returned from holdEvent
   */
  releaseEvent(token) {
    delete this._heldEvents[token];
  }
}

module.exports = EventHolder;
