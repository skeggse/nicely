(function() {
  var root = this;

  var previousDirectly = root.directly;

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
          return callback(errored = err);
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
        return callback(errored = err);
      // set parameter
      params[ticker++] = result;
      // call back if done
      if (ticker === times)
        callback(null, params);
    };
  };

  nicely.version = nicely.VERSION = '0.0.2';

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

  module.exports = nicely;
}).call(this);
