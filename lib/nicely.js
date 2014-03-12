;(function(root) {
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

  var Task = function Task(fn, me, args) {
    this.fn = fn;
    this.me = me;
    this.args = args;
  };

  var nicely = function nicely(callback) {
    if (typeof callback !== 'function')
      throw new TypeError('callback must be a function');
    // whether the task group has errored
    var error = false;
    // list of active tasks
    var tasks = [], count = 0;
    // the result parameters
    var params = null;
    // actually begin execution
    defer(function begin() {
      // we've started, don't continue adding tasks
      params = {};
      count = tasks.length;
      // begin the tasks!
      tasks.forEach(function(task) {
        task.fn.apply(task.me, task.args);
      });
    });
    // create an anonymous function that sets the field
    return function run(field, fn) {
      if (params !== null)
        throw new Error('execution already started');
      var args = arraySlice.call(arguments, 2);
      // handles a response
      // *must be called only once*
      args.push(function after(err, result) {
        // ignore if errored
        if (error)
          return;
        // callback with error
        if (err)
          return callback(error = err, field);
        // set parameter
        params[field] = result;
        // call back if done
        if (--count === 0)
          callback(null, params);
      });
      // add to active tasks
      tasks.push(new Task(fn, this, args));
    };
  };

  nicely.simply = function simply(times, callback) {
    if (typeof callback !== 'function')
      throw new TypeError('callback must be a function');
    // whether an error has occurred
    var errored = false;
    // array of active tasks
    // handles a response
    // *must be called #times*
    return function next(err) {
      // ignore if errored or done
      if (errored || times <= 0)
        return;
      // callback with error
      if (err)
        return callback(errored = err);
      // call back if done
      if (--times === 0)
        callback(null);
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
    // current done state
    var state = false;
    // the result parameters
    var params = {};
    // the task queue
    var taskQueue = [];
    // handles the end of one task
    var endTask = function(name, err, result) {
      // just in case they called back and then threw
      if (state)
        return;
      if (err) {
        state = true;
        return callback.call(params, err, name);
      }
      params[name] = result;
      processTask();
    };
    // processes one task
    var processTask = function() {
      // fetch the next task
      var item = taskQueue.shift();
      if (!item) {
        // we're done!
        state = true;
        return callback.call(params, null, params);
      }
      // make sure we don't allow uncaught exceptions, a common problem here
      try {
        item[0].apply(params, item[2]);
      } catch (err) {
        endTask(item[1], err);
      }
    };
    // begins queue processing on (start of) next tick
    // should defer happen in processTask, for every call?
    defer(processTask);
    // queues another function
    return function queue(/*name, fn, args...*/) {
      var args = arraySlice.call(arguments);
      var name = args.shift();
      args.push(bind(endTask, this, name));
      taskQueue.push([args.shift(), name, args]);
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

  nicely.version = nicely.VERSION = '0.1.3';

  nicely._ = {
    nicely: nicely
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined')
      exports = module.exports = nicely;
    exports.nicely = nicely;
  } else {
    var previousNicely = root.nicely;

    root.nicely = nicely;

    nicely.noConflict = function() {
      root.nicely = previousNicely;
    };
  }
})(this);
