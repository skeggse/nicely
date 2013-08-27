var nicely = require('..');

var sinon = require('sinon');
var expect = require('expect.js');

var greek = {
  alpha: 'beta',
  gamma: 'delta',
  epsilon: 'zeta',
  eta: 'theta'
};

describe('nicely', function() {
  var error = new Error('the failure');
  var next, spy;

  beforeEach(function() {
    next = nicely(spy = sinon.spy());
  });

  var baseCheck = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(2);
  };

  var checkHappy = function(done) {
    process.nextTick(function() {
      baseCheck();
      expect(spy.args[0][0]).to.not.be.an(Error);
      expect(spy.args[0][0]).to.not.be.ok();
      expect(spy.args[0][1]).to.eql(greek);
      done();
    });
  };

  var checkLonely = function(done) {
    if (done) {
      process.nextTick(function() {
        expect(spy.called).to.not.be.ok();
        done();
      });
    } else {
      expect(spy.called).to.not.be.ok();
    }
  };

  var checkSad = function(field, done) {
    process.nextTick(function() {
      baseCheck();
      expect(spy.args[0][0]).to.equal(error);
      expect(spy.args[0][1]).to.equal(field);
      done();
    });
  };

  var later = function() {
    var self = this, args = arguments;
    return function(callback) {
      callback.apply(self, args);
    };
  };

  it('should call back with correct results', function(done) {
    for (var key in greek)
      next(key, later(null, greek[key]));
    checkHappy(done);
  });

  it('should pass the error', function(done) {
    // may fail, greek not necessarily in-order, so 'alpha' may not be first
    for (var key in greek)
      next(key, later(error));
    checkSad('alpha', done);
  });

  it('should ignore the data on error', function(done) {
    for (var key in greek) {
      if (key === 'eta')
        next(key, later(error));
      else
        next(key, later(null, greek[key]));
    }
    checkSad('eta', done);
  });

  it('should error when next called after start', function(done) {
    for (var key in greek)
      if (key !== 'eta')
        next(key, later(null, greek[key]));
    checkLonely();
    process.nextTick(function() {
      expect(function() {
        next(key, later(null, greek.eta));
      }).to.throwError();
      done();
    });
  });
});
