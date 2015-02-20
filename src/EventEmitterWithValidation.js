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
 * @providesModule EventEmitterWithValidation
 * @typechecks
 */

'use strict';

var EventEmitter = require('EventEmitter');

/**
 * @class EventEmitterWithValidation
 */
class EventEmitterWithValidation extends EventEmitter {
  /**
   * @constructor
   * @param {object} eventTypes Collection of valid event types.
   */
  constructor(eventTypes) {
    super();
    this._eventTypes = Object.keys(eventTypes);
  }

  /**
   * @param {string} eventType Name of the event to emit.
   * @param {...*} Arbitrary arguments to be passed to each registered listener.
   */
  emit(eventType) {
    assertAllowsEventType(eventType, this._eventTypes);
    return super.emit.apply(this, arguments);
  }
}

function assertAllowsEventType(type, allowedTypes) {
  if (allowedTypes.indexOf(type) === -1) {
    throw new TypeError(errorMessageFor(type, allowedTypes));
  }
}

function errorMessageFor(type, allowedTypes) {
  var message = 'Unknown event type "' + type + '". ';
  if (__DEV__) {
    message += recommendationFor(type, allowedTypes);
  }
  message += 'Known event types: ' + allowedTypes.join(', ') + '.';
  return message;
}

// Allow for good error messages
if (__DEV__) {
  var recommendationFor = function(type, allowedTypes) {
    var closestTypeRecommendation = closestTypeFor(type, allowedTypes);
    if (isCloseEnough(closestTypeRecommendation, type)) {
      return 'Did you mean "' + closestTypeRecommendation.type + '"? ';
    } else {
      return '';
    }
  };

  var closestTypeFor = function(type, allowedTypes) {
    var typeRecommendations = allowedTypes.map(
      typeRecommendationFor.bind(this, type)
    );
    return typeRecommendations.sort(recommendationSort)[0];
  };

  var typeRecommendationFor = function(type, recomendedType) {
    return {
      type: recomendedType,
      distance: damerauLevenshteinDistance(type, recomendedType)
    };
  };

  var recommendationSort = function(recommendationA, recommendationB) {
    if (recommendationA.distance < recommendationB.distance) {
      return -1;
    } else if (recommendationA.distance > recommendationB.distance) {
      return 1;
    } else {
      return 0;
    }
  };

  var isCloseEnough = function(closestType, actualType) {
    return (closestType.distance / actualType.length) < 0.334;
  };

  var damerauLevenshteinDistance = function(a, b) {
    var i, j;
    var d = [];

    for (i = 0; i <= a.length; i++) {
      d[i] = [i];
    }

    for (j = 1; j <= b.length; j++) {
      d[0][j] = j;
    }

    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;

        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );

        if (i > 1 && j > 1 &&
            a.charAt(i - 1) == b.charAt(j - 2) &&
            a.charAt(i - 2) == b.charAt(j - 1)) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
        }
      }
    }

    return d[a.length][b.length];
  };
}

module.exports = EventEmitterWithValidation;
