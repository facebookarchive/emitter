# EventEmitter

Facebook's EventEmitter is a simple emitter implementation that prioritizes speed and simplicity. It is conceptually similar to other emitters like Node's EventEmitter, but the precise APIs differ. More complex abstractions like the event systems used on facebook.com and m.facebook.com can be built on top of EventEmitter as well DOM event systems.

## API Concepts

EventEmitter's API shares many concepts with other emitter APIs. When events are emitted through an emitter instance, all listeners for the given event type are invoked.

```js
var emitter = new EventEmitter();
emitter.addListener('event', function(x, y) { console.log(x, y); });
emitter.emit('event', 5, 10);  // Listener prints "5 10".
```

EventEmitters return a subscription for each added listener. Subscriptions provide a convenient way to remove listeners that ensures they are removed from the correct emitter instance.

```js
var subscription = emitter.addListener('event', listener);
subscription.remove();
```

## Usage

First install the `fbemitter` package via `npm`, then you can require or import it.

```js
var {EventEmitter} = require('fbemitter');
var emitter = new EventEmitter();

```

## Building from source

Once you have the repository cloned, building a copy of `fbemitter` is easy, just run `gulp build`. This assumes you've installed `gulp` globally with `npm install -g gulp`.

```sh
gulp build
```

## Contribute

The main purpose of this repository is to share Facebook's implementation of an emitter. Please see React's [contributing article](https://github.com/facebook/react/blob/master/CONTRIBUTING.md), which generally applies to `fbemitter`, if you are interested in submitting a pull request.
