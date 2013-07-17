var nicely = require('..');

var sinon = require('sinon');
var expect = require('expect.js');

var greek = {
  alpha: 'beta',
  gamma: 'delta',
  epsilon: 'zeta',
  eta: 'theta'
};

var prefix = 'stop, hammertime! ';

describe('additionally', function() {
  var spy, alter;

  beforeEach(function() {
    spy = sinon.spy();
    alter = nicely.additionally(prefix, spy);
  });

  var baseCheck = function(length) {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(length);
  };

  var checkError = function(length) {
    baseCheck(length);
    expect(spy.args[0][0]).to.be.an(Error);
    expect(spy.args[0][0].message).to.be.a('string');
    expect(spy.args[0][0].message.substr(0, prefix.length)).to.equal(prefix);
  };

  it('should ignore if no error', function() {
    var args = [null, 'hello', greek];
    alter.apply(global, args);
    baseCheck(3);
    expect(spy.args[0]).to.eql(args);
  });

  it('should prefix the error', function() {
    alter(new Error('testing'));
    checkError(1);
  });

  it('should not affect the data', function() {
    alter(new Error('testing'), 'hello', greek);
    checkError(3);
    expect(spy.args[0][1]).to.equal('hello');
    expect(spy.args[0][2]).to.equal(greek);
  });
});
