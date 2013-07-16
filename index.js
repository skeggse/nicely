var nicely = function nicely(times, callback) {
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

module.exports = nicely;
