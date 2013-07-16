nicely
======

A minimalist asynchronous handler, modeled after `_.after` from [underscore][].

install
=======

[npm][]
-------

```sh
$ npm install nicely
```

[github][]
----------

```sh
$ git clone https://github.com/skeggse/nicely.git
```

test
====

*remember to* `npm install`!

```sh
nicely$ mocha
nicely$ npm test
nicely$ make test
```

api
===

nicely(times, fn)
-----------------

When you wish to collect the results of a bunch of asynchronous operations in an object, use `nicely`.

The primary export, which collects results in an object. Use as follows:

```js
var nicely = require('nicely');

var next = nicely(4, function done(err, object) {
  if (err)
    return console.log('there was an error!', err);
  console.log('something good happened!', object);
});

// next(field) returns after(err, result)

doSomethingFailureProne('getPass', next('pass'));
doSomethingFailureProne('getName', next('name'));
doSomethingFailureProne('getEmail', next('email'));
doSomethingFailureProne('getPhone', next('phone'));

// if all doSomethingFailureProne succeed:
//   "something good happened!", object
// if >= 1 doSomethingFailureProne fail:
//   "there was an error!", err
```

#### next(field)

Returns `after(err, result)` with a closure for `field`.

Call `next` when providing an operation with a callback.

#### after(err, result)

Invokes `done` if `times` has been reached.

Call `after` once an operation is complete (or let the operation do the dirty work).

nicely.directly(times, fn)
--------------------------

When you wish to collect the results of a bunch of asynchronous operations in an array, in-order, use `directly`.

A little simpler than `nicely(times, fn)`, this collects results in an array:

```js
var nicely = require('nicely');

var next = nicely.directly(4, function done(err, array) {
  if (err)
    return console.log('there was an error!', err);
  console.log('something good happened!', array);
});

// next(err, result) appends to the result

doSomethingFailureProne('getPass', next);
doSomethingFailureProne('getName', next);
doSomethingFailureProne('getEmail', next);
doSomethingFailureProne('getPhone', next);

// if all doSomethingFailureProne succeed:
//   "something good happened!", array
// if >= 1 doSomethingFailureProne fail:
//   "there was an error!", err
```

#### next(err, result)

Invokes `done` if `times` has been reached.

Call `next` once an operation is complete, or pass it as the callback to an operation.

nicely.sequentially(fn)
-----------------------

When you wish to execute a sequence of asynchronous operations, one at a time, and collect the results in an array, use `nicely.sequentially`.

Unlike `nicely` and `nicely.directly`, `nicely.sequentially` does not accept a `times` parameter. Instead, all operations added with `queue` will complete--unless one fails--before `fn` is called.

Similar to `nicely.directly(times, fn)`, this aggregates results in an array:

```js
var nicely = require('nicely');

var queue = nicely.sequentially(function done(err, array) {
  if (err)
    return console.log('there was an error!', err);
  console.log('something good happened!', array);
});

// queue(fn, args...) queues the specified task for execution

queue(doSomethingFailureProne, 'getPass');
queue(doSomethingFailureProne, 'getName');
queue(doSomethingFailureProne, 'getEmail');
queue(doSomethingFailureProne, 'getPhone');

// if all doSomethingFailureProne succeed:
//   "something good happened!", array
// if >= 1 doSomethingFailureProne fail:
//   "there was an error!", err
```

#### queue(fn, args...)

Invokes `fn` after all previous queued functions succeed.

Call `queue` to queue the operation for execution.

*note:* For those less inclined to type, feel free to use the `nicely.sequence` alias.

nicely.intently([options], callback)
----------------------------------

When you wish to retry a task, use `nicely.intently`.

This function only executes a single task, unlike the other functions in `nicely`, but is compatible with all three, and will return a configured, reusable `begin` function.

The `options` parameter is optional, but must be an `Object` if specified, containing zero or more of the following properties:

- `times` the number of times to retry before failing, or 0 to retry forever (default 0)
- `backoff` the backoff for the delay (default 2.0)
  - every retry causes `intently` to wait twice as long as the previous retry
- `initial` the initial delay between task retries (default 100)
- `maximum` the maximum delay between task retries (default 5000)
- `defer` determines whether the task executes the instant `begin` is called (default `false`)

*note:* All times are in milliseconds.

#### Simple Scenario

```js
var nicely = require('nicely');

var begin = nicely.intently({
  times: 3, // default: 0
  backoff: 2, // default
  initial: 100, // default
  maximum: 300, // default 5000
  defer: true // default false
}, function(err, array) {
  if (err)
    return console.log('error: ' + err.message);
  console.log('woo!', array);
});

// begin(fn, args...) executes the specified task

begin(function(message, callback) {
  console.log(message);
  callback(new Error(message));
}, 'i tried!');

console.log('begin trying');
```

This simple example will print out:

```
begin trying
i tried!
i tried!
i tried!
error: i tried!
```

#### Complex Scenario

```js
var nicely = require('nicely');

var next = nicely.directly(4, function done(err, array) {
  if (err)
    return console.log('there was an error!', err);
  console.log('something good happened!', array);
});

var begin = nicely.intently({
  times: 3, // default: 0
  backoff: 2, // default
  initial: 100, // default
  maximum: 300, // default 5000
  defer: false // default
}, next);

// begin(fn, args...) executes the specified task

begin(doSomethingFailureProne, 'getPass');
begin(doSomethingFailureProne, 'getName');
begin(doSomethingFailureProne, 'getEmail');
begin(doSomethingFailureProne, 'getPhone');

// if all doSomethingFailureProne succeed after at most thrice calls
//   "something good happened!", array
// if >= 1 doSomethingFailureProne fails three times
//   "there was an error!", err
```

#### begin(fn, args...)

Invokes `fn` with the provided `args` and retries if failure following the guidelines specified above.

Similar to `queue(fn, args...)`, but executes `fn` immediately.

integration
===========

underscore
----------

Integrate into underscore:

```js
var _ = require('underscore');
var nicely = require('nicely');

_.mixin(nicely._);

// _.nicely === nicely
```

browser
-------

nicely is browser-ready, and mimics underscore's browser setup mechanism and `noConflict` function. nicely does not come in a minified for, but feel free to add it to your project as a vendor file and minify it together with your source. nicely is, after all, in the public domain, so no attribution comment is necessary.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>nicely in a browser</title>
  </head>
  <body>
    <script src="nicely.js"></script>
  </body>
</html>
```

todo
====

- add test to ensure `result` does not change with calls after `done()`
- move test's check functions to a unified file
- intently code improvements (see [nicely.js][])
  - add formal defer option tests
  - add formal argument handling tests

unlicense / public domain
=========================

> This is free and unencumbered software released into the public domain.

> Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

> In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

> For more information, please refer to <[http://unlicense.org/](http://unlicense.org/)>

[underscore]: http://underscorejs.org "underscorejs.org"
[npm]: https://npmjs.org/package/nicely "nicely on npm"
[github]: https://github.com/skeggse/nicely "nicely on github"
[nicely.js]: https://github.com/skeggse/nicely/blob/master/lib/nicely.js "lib/nicely.js"
