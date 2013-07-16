var directly = require('..').directly;

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

describe('directly', function() {
  var error = new Error('the failure');
  var next, spy;

  beforeEach(function() {
    next = directly(8, spy = sinon.spy());
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
    for (var i = 0; i < greek.length; i++)
      next(null, greek[i]);
    checkHappy();
  });

  it('should pass the error', function() {
    for (var i = 0; i < greek.length; i++)
      next(error);
    checkSad();
  });

  it('should ignore the data on error', function() {
    for (var i = 1; i < greek.length; i++)
      next(null, greek[1]);
    next(error);
    checkSad();
  });

  it('should do nothing with few calls', function() {
    for (var i = 1; i < greek.length; i++)
      next(null, greek[i]);
    checkLonely();
  });

  it('should call back once with many calls', function() {
    var i;
    for (i = 0; i < greek.length; i++)
      next(null, greek[i]);
    for (i = 0; i < greek.length; i++)
      next(null, greek[i]);
    checkHappy();
  });
});
