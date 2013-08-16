var nicely = require('..');

var sinon = require('sinon');
var expect = require('expect.js');

describe('simply', function() {
  var error = new Error('the failure');
  var next, spy;

  beforeEach(function() {
    next = nicely.simply(4, spy = sinon.spy());
  });

  var baseCheck = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(1);
  };

  var checkHappy = function() {
    baseCheck();
    expect(spy.args[0][0]).to.not.be.an(Error);
    expect(spy.args[0][0]).to.not.be.ok();
  };

  var checkLonely = function() {
    expect(spy.called).to.not.be.ok();
  };

  var checkSad = function() {
    baseCheck();
    expect(spy.args[0][0]).to.equal(error);
  };

  it('should call back without an error', function() {
    for (var i = 0; i < 4; i++)
      next();
    checkHappy();
  });

  it('should pass the error', function() {
    for (var i = 0; i < 4; i++)
      next(error);
    checkSad();
  });

  it('should do nothing with few calls', function() {
    for (var i = 0; i < 3; i++)
      next();
    checkLonely();
  });

  it('should call back once with many calls', function() {
    for (var i = 0; i < 5; i++)
      next();
    checkHappy();
  });
});
