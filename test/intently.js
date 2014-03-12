var nicely = require('..');

var sinon = require('sinon');
var expect = require('expect.js');

var greek = {
  alpha: 'beta',
  gamma: 'delta',
  epsilon: 'zeta',
  eta: 'theta'
};

// so the tests continue to work even if defaults change
var testOptions = {
  times: 0,
  backoff: 2,
  initial: 100,
  maximum: 5000
};

var passable = {};

describe('intently', function() {
  var error = new Error('the failure');
  var responses = null, spy, opts;
  var clock;

  beforeEach(function() {
    spy = sinon.spy();
    clock = sinon.useFakeTimers();
  });

  var run = function() {
    responses = Array.prototype.slice.call(arguments);
    var begin = nicely.intently(opts || testOptions, spy);
    begin(respond, passable);
  };

  afterEach(function() {
    clock.restore();
    respond = _respond;
    opts = undefined;
  });

  var respond = function(p, callback) {
    expect(p).to.equal(passable);
    if (!responses.length)
      throw new Error('out of responses');
    callback.apply(null, responses.shift());
  };
  var _respond = respond;

  var baseCheck = function(length) {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(length);
  };

  var checkHappy = function() {
    baseCheck(2);
    expect(spy.args[0][0]).to.not.be.an(Error);
    expect(spy.args[0][0]).to.not.be.ok();
    expect(spy.args[0][1]).to.eql(greek);
  };

  var checkLonely = function(resp) {
    expect(spy.called).to.not.be.ok();
    expect(responses).to.have.length(resp);
  };

  var checkSad = function() {
    baseCheck(1);
    expect(spy.args[0][0]).to.equal(error);
    expect(spy.args[0][1]).to.not.be.ok();
  };

  it('should complete on success', function() {
    run([null, greek]);
    checkHappy();
  });

  describe('times', function() {
    it('should handle times=0', function() {
      opts = {times: 0};
      run([error], [error], [error], [error], [null, greek]);
      checkLonely(4);
      clock.tick(100);
      checkLonely(3);
      clock.tick(200);
      checkLonely(2);
      clock.tick(400);
      checkLonely(1);
      clock.tick(800);
      checkHappy();
    });

    it('should handle times=1', function() {
      opts = {times: 1};
      run([error]);
      checkSad();
    });

    it('should handle times=2', function() {
      opts = {times: 2};
      run([error], [error]);
      checkLonely(1);
      clock.tick(100);
      checkSad();
    });
  });

  describe('backoff', function() {
    it('should handle backoff=1', function() {
      opts = {backoff: 1};
      run([error], [error], [null, greek]);
      checkLonely(2);
      clock.tick(100);
      checkLonely(1);
      clock.tick(100);
      checkHappy();
    });

    it('should handle backoff=1.5', function() {
      opts = {backoff: 1.5};
      run([error], [error], [null, greek]);
      checkLonely(2);
      clock.tick(100);
      checkLonely(1);
      clock.tick(150);
      checkHappy();
    });

    it('should handle backoff=2', function() {
      opts = {backoff: 2};
      run([error], [error], [null, greek]);
      checkLonely(2);
      clock.tick(100);
      checkLonely(1);
      clock.tick(200);
      checkHappy();
    });
  });

  describe('initial', function() {
    it('should handle initial=100', function() {
      opts = {initial: 100};
      run([error], [error], [null, greek]);
      checkLonely(2);
      clock.tick(100);
      checkLonely(1);
      clock.tick(200);
      checkHappy();
    });

    it('should handle initial=1000', function() {
      opts = {initial: 1000};
      run([error], [error], [null, greek]);
      checkLonely(2);
      clock.tick(1000);
      checkLonely(1);
      clock.tick(2000);
      checkHappy();
    });
  });

  describe('maximum', function() {
    it('should handle the maximum', function() {
      opts = {maximum: 5000, initial: 1000};
      run([error], [error], [error], [error], [null, greek]);
      checkLonely(4);
      clock.tick(1000);
      checkLonely(3);
      clock.tick(2000);
      checkLonely(2);
      clock.tick(4000);
      checkLonely(1);
      clock.tick(5000);
      checkHappy();
    });
  });

  describe('reuse', function() {
    it('should be reusable', function() {
      responses = [[error], [null, greek]];
      var backoff = nicely.intently(testOptions, spy);
      backoff(respond, passable);
      checkLonely(1);
      clock.tick(100);
      checkHappy();
      spy.reset();
      responses = [[error], [null, greek]];
      backoff(respond, passable);
      checkLonely(1);
      clock.tick(100);
      checkHappy();
    });
  });

  describe('abort', function() {
    it('should abort for certain errors', function() {
      opts = {
        abort: function(err) {
          return 'status' in err;
        }
      };
      var err = new Error('the failure');
      err.status = 400;
      run([err]);
      clock.tick(100);
      baseCheck(1);
      expect(spy.args[0][0]).to.equal(err);
      expect(spy.args[0][1]).to.not.be.ok();
    });
  });
});
