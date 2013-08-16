var nicely = require('..');

var sinon = require('sinon');
var expect = require('expect.js');

var greek = {
  alpha: 'beta',
  gamma: 'delta',
  epsilon: 'zeta',
  eta: 'theta'
};
var keys = Object.keys(greek);

describe('sequentially', function() {
  var error = new Error('the failure');
  var queue, spy;

  var start = function(done) {
    queue = nicely.sequentially(spy = sinon.spy(done));
  };

  var baseCheck = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(2);
  };

  var checkHappy = function(done, object) {
    return function() {
      baseCheck();
      expect(spy.args[0][0]).to.not.be.an(Error);
      expect(spy.args[0][0]).to.not.be.ok();
      expect(spy.args[0][1]).to.eql(object || greek);
      done();
    };
  };

  var checkLonely = function(done) {
    return function() {
      expect(spy.called).to.not.be.ok();
      done();
    };
  };

  var checkSad = function(done, params) {
    return function() {
      baseCheck();
      expect(spy.args[0][0]).to.equal(error);
      expect(spy.args[0][1]).to.eql(params);
      done();
    };
  };

  var stubby = function(result, callback) {
    if (result)
      callback(null, result);
    else
      callback(error);
  };

  it('should call back with correct results', function(done) {
    start(checkHappy(done));
    for (var key in greek)
      queue(key, stubby, greek[key]);
  });

  it('should pass the error', function(done) {
    start(checkSad(done, keys[0]));
    for (var i = 0; i < keys.length; i++)
      queue(keys[i], stubby, null);
  });

  it('should ignore the data on error', function(done) {
    start(checkSad(done, 'errored'));
    for (var i = 1; i < keys.length; i++)
      queue(keys[i], stubby, greek[keys[i]]);
    queue('errored', stubby, null);
  });

  it('should allow updates after tick', function(done) {
    start(checkHappy(done, {alpha: true, beta: 'nicely'}));
    queue('alpha', function adder(callback) {
      queue('beta', stubby, 'nicely');
      callback(null, true);
    });
  });
});
