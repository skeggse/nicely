var nicely = require('..');

var sinon = require('sinon');
var expect = require('expect.js');

var greek = [
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'theta'
];

describe('sequentially', function() {
  var error = new Error('the failure');
  var queue, spy;

  var start = function(done) {
    queue = nicely.sequentially(spy = sinon.spy(done));
  };

  var checkHappy = function(done, object) {
    return function() {
      expect(spy.called).to.be.ok();
      expect(spy.calledOnce).to.be.ok();
      expect(spy.args[0]).to.have.length(2);
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

  var checkSad = function(done) {
    return function() {
      expect(spy.called).to.be.ok();
      expect(spy.calledOnce).to.be.ok();
      expect(spy.args[0].length).to.be.within(1, 2);
      expect(spy.args[0][0]).to.equal(error);
      if (spy.args[0].length === 2)
        expect(spy.args[0][1]).to.not.be.ok();
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
    for (var i = 0; i < greek.length; i++)
      queue(stubby, greek[i]);
  });

  it('should pass the error', function(done) {
    start(checkSad(done));
    for (var i = 0; i < greek.length; i++)
      queue(stubby, null);
  });

  it('should ignore the data on error', function(done) {
    start(checkSad(done));
    for (var i = 1; i < greek.length; i++)
      queue(stubby, greek[i]);
    queue(stubby, null);
  });

  it('should allow updates after tick', function(done) {
    debugger;
    start(checkHappy(done, [true, 'nicely']));
    queue(function adder(callback) {
      queue(stubby, 'nicely');
      callback(null, true);
    });
  });
});
