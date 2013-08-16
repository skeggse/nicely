(function() {
  var root = this;

  var specialMeaning = {};

  var previousDirectly = root.directly;

  var fnBind = Function.prototype.bind;
  var arraySlice = Array.prototype.slice;

  var bind = function(fn, context) {
    var args;
    if (fnBind && fn.bind)
      return fnBind.apply(fn, arraySlice.call(arguments, 1));
    args = arraySlice.call(arguments, 2);
    return function bound() {
      return fn.apply(context, args.concat(arraySlice.call(arguments)));
    };
  };

  var defer = (function() {
    if (typeof process !== 'undefined')
      return bind(process.nextTick, process);
    return function(fn) {
      setTimeout(fn, 1);
    };
  }());

  var nicely = function nicely(times, callback) {
    if (typeof callback !== 'function')
      throw new TypeError('callback must be a function');
    // whether an error has occured
    var errored = false;
    // the result parameters
    var params = {};
    // create an anonymous function that sets the field
    return function next(field) {
      // handles a response
      // *must be called only once*
      return function after(err, result) {
        // ignore if errored or done
        if (errored || times <= 0)
          return;
        // callback with error
        if (err)
          return callback(errored = err, field);
        // set parameter
        params[field] = result;
        // call back if done
        if (--times === 0)
          callback(null, params);
      };
    };
  };

  nicely.directly = function directly(times, callback) {
    if (typeof callback !== 'function')
      throw new TypeError('callback must be a function');
    // whether an error has occured
    var errored = false;
    // the result parameters
    var params = new Array(times);
    // the ticker
    var ticker = 0;
    // handles a response
    // *must be called #times*
    return function next(err, result) {
      // ignore if errored or done
      if (errored || ticker >= times)
        return;
      // callback with error
      if (err)
        return callback(errored = err, ticker);
      // set parameter
      params[ticker++] = result;
      // call back if done
      if (ticker === times)
        callback(null, params);
    };
  };

  // sequentially fits with the theme, but is hard to type right
  nicely.sequentially =
  nicely.sequence = function sequentially(callback) {
    if (typeof callback !== 'function')
      throw new TypeError('callback must be a function');
    // the result parameters
    var params = {};
    // the task queue
    var taskQueue = [];
    // processes one task
    var processTask = function(name, err, result) {
      if (err)
        return callback.call(params, err, name);
      params[name] = result;
      var item = taskQueue.shift();
      if (item)
        item[0].apply(params, item[1]);
      else
        callback.call(params, null, params);
    };
    // begins queue processing on (start of) next tick
    // should defer happen in processTask, for every call?
    defer(function launch() {
      var item = taskQueue.shift();
      if (item)
        item[0].apply(params, item[1]);
      else
        callback.call(params, null, params);
    });
    // queues another function
    return function queue(/*name, fn, args...*/) {
      var args = arraySlice.call(arguments);
      args.push(bind(processTask, this, args.shift()));
      taskQueue.push([args.shift(), args]);
    };
  };

  var intentlyDefaults = {
    times: 0,
    backoff: 2,
    initial: 100,
    maximum: 5000
    // defer: false
  };
  // TODO: use different variables for callback and fn in different scores?
  //       to avoid confusion.
  // TODO: need to make opts optional
  nicely.intently = function intently(opts, callback) {
    var callback = arguments[arguments.length - 1];
    if (typeof callback !== 'function')
      throw new TypeError('callback must be a function');
    opts = typeof opts === 'object' ? opts : {};
    var options = {};
    options.defer = !!opts.defer;
    for (var key in intentlyDefaults)
      options[key] = typeof opts[key] === 'number' ? opts[key] : intentlyDefaults[key];
    return function begin(fn) {
      var calls = options.times || null;
      var delay = options.initial;
      var retry = function(err, result) {
        if (!err)
          return callback(null, result);
        if (calls !== null && --calls === 0)
          return callback(err);
        setTimeout(boundFn, delay);
        delay = Math.min(delay * options.backoff, options.maximum);
      };
      var fnArgs = arraySlice.call(arguments, 1);
      fnArgs.push(retry);
      var boundFn = bind.apply(root, [fn, root].concat(fnArgs));
      if (options.defer)
        defer(boundFn);
      else
        fn.apply(root, fnArgs);
    };
  };

  nicely.version = nicely.VERSION = '0.1.1';

  nicely.noConflict = function() {
    root.directly = previousDirectly;
  };

  nicely._ = {
    nicely: nicely
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined')
      exports = module.exports = nicely;
    exports.nicely = nicely;
  } else
    root.nicely = nicely;
}).call(this);
