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
    next = nicely(4, spy = sinon.spy());
  });

  var checkHappy = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(2);
    expect(spy.args[0][0]).to.not.be.an(Error);
    expect(spy.args[0][0]).to.not.be.ok();
    expect(spy.args[0][1]).to.eql(greek);
  };

  var checkLonely = function() {
    expect(spy.called).to.not.be.ok();
  };

  var checkSad = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0].length).to.be.within(1, 2);
    expect(spy.args[0][0]).to.equal(error);
    if (spy.args[0].length === 2)
      expect(spy.args[0][1]).to.not.be.ok();
  };

  it('should call back with correct results', function() {
    for (var key in greek)
      next(key)(null, greek[key]);
    checkHappy();
  });

  it('should pass the error', function() {
    for (var key in greek)
      next(key)(error);
    checkSad();
  });

  it('should ignore the data on error', function() {
    for (var key in greek) {
      if (key === 'eta')
        next(key)(error);
      else
        next(key)(null, greek[key]);
    }
    checkSad();
  });

  it('should do nothing with few calls', function() {
    for (var key in greek)
      if (key !== 'eta')
        next(key)(null, greek[key]);
    checkLonely();
  });

  it('should call back once with many calls', function() {
    var key;
    for (key in greek)
      next(key)(null, greek[key]);
    for (key in greek)
      next(key)(null, greek[key]);
    checkHappy();
  });
});
