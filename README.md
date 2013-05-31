# EventEmitter

Facebook's EventEmitter is a simple emitter implementation that prioritizes speed and simplicity. It is conceptually similar to other emitters like Node's EventEmitter, but the precise APIs differ. More complex abstractions like the event systems used on facebook.com and m.facebook.com can be built on top of EventEmitter as well DOM event systems.

## API Concepts

EventEmitter's API shares many concepts with other emitter APIs. When events are emitted through an emitter instance, all listeners for the given event type are invoked.

```js
var emitter = new EventEmitter();
emitter.addListener('event', function(x, y) { console.log(x, y); }
emitter.emit('event', 5, 10);  // Listener prints "5 10".
```

EventEmitters return a subscription for each added listener. Subscriptions provide a convenient way to remove listeners that ensures they are removed from the correct emitter instance.

```js
var subscription = emitter.addListener('event', listener);
subscription.remove();
```

### Holding

Sometimes it is useful to hold onto events when they are emitted so that a listener that is added in the future can receive them. For example, it is often prohibitively slow to download all of the JavaScript for a page before displaying it. Event holding allows us to hold onto click events that occur before all of the page's JavaScript has been downloaded. Once the page is completely set up, we can replay the held events to click listeners that are now ready.

Event holding is optional and composed with any EventEmitter and EventHolder. This library comes with a default EventHolder implementation. You can provide a custom implementations for more complex use cases.

```js
var emitter = new EventEmitterWithHolding(
  new EventEmitter(),
  new EventHolder()
);
emitter.emitAndHold('event', 1, 2);  // held
emitter.emit('event', 3, 4);         // not held
emitter.addRetroactiveListener('event', function(x, y) {
  console.log(x, y);
});  // Held event is re-emitted and listener prints "1 2".
```

### Validation

Mistyped or mistakenly specified event names are not detected by general static analysis tools like linters and type checkers. Bugs of this type can manifest themselves in subtle and unexpected ways at runtime. To surface these bugs more quickly by failing faster and more explicitly, we provide event-type validation that can be composed with an EventEmitter.

```js
var emitter = EventValidator.addValidation(
  new EventEmitter(),
  {constructed: true, destroyed: true}
);
emitter.emit('constructed');  // OK
emitter.emit('destoryed');    // Did you mean "destroyed"?
```

## Installation

Currently we provide a Gruntfile to build `fbemitter.js`, which exports the constructor functions of the EventEmitter library.

### Building Your Copy of EventEmitter

The process to build `fbemitter.js` is built entirely on top of node.js, using many libraries you may already be familiar with.

#### Prerequisites

* You have `node` installed at v0.10.0+ (it might work at lower versions, we just haven't tested).
* You are familiar with `npm` and know whether or not you need to use `sudo` when installing packages globally.
* You are familiar with `git`.

#### Build

Once you have the repository cloned, building a copy of `fbemitter.js` is relatively easy.

```sh
# grunt-cli is needed by grunt; you might have this installed already
npm install -g grunt-cli
npm install
grunt build
```

At this point, you should now have a `build/` directory populated with everything you need to use EventEmitter. The examples should all work.

### Grunt

We use grunt to automate many tasks. Run `grunt -h` to see a mostly complete listing. The important ones to know:

```sh
# Create test build & run tests with PhantomJS
grunt test
# Lint the core library code with JSHint
grunt lint
# Lint package code
grunt lint:package
# Wipe out build directory
grunt clean
```

## Contribute

The main purpose of this repository is to share Facebook's implementation of an emitter. Please see React's [contributing article](https://github.com/facebook/react/blob/master/CONTRIBUTING.md), which generally applies to EventEmitter, if you are interested in submitting a pull request.
