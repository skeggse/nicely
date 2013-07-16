nicely
======

A minimalist asynchronous handler, modeled after `_.after` from [underscore][].

install
=======

[npm][]
-------

```
$ npm install nicely
```

[github][]
----------

```
$ git clone https://github.com/skeggse/nicely.git
```

test
====

*remember to* `npm install`!

```
nicely$ mocha
nicely$ npm test
nicely$ make test
```

api
===

nicely(times, fn)
-----------------

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
//   "there was an error!", err
// if >= 1 doSomethingFailureProne fail:
//   "something good happened!", object
```

#### next(field)

Returns `after(err, result)` with a closure for `field`.

Call `next` when providing an operation with a callback.

#### after(err, result)

Invokes `done` if `times` has been reached.

Call `after` once an operation is complete (or let the operation do the dirty work).

nicely.directly(times, fn)
------------------------

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

// if all doSomethingFailureProne succeed: done(null, [...])
// if >= 1 doSomethingFailureProne fail:   done(firstError)
```

#### next(err, result)

Invokes `done` if `times` has been reached.

Call `next` once an operation is complete, or pass it as the callback to an operation.

underscore
==========

Integrate into underscore:

```js
var _ = require('underscore');
var nicely = require('nicely');

_.mixin(nicely._);

// _.nicely === nicely
```

todo
====

* add test to ensure `result` does not change with calls after `done()`

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
