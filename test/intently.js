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
    nicely.intently(opts || testOptions, spy, respond);
  };

  afterEach(function() {
    clock.restore();
    respond = _respond;
    opts = undefined;
  });

  var respond = function(callback) {
    if (!responses.length)
      throw new Error('out of responses');
    callback.apply(global, responses.shift());
  };
  var _respond = respond;

  var checkHappy = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0]).to.have.length(2);
    expect(spy.args[0][0]).to.not.be.an(Error);
    expect(spy.args[0][0]).to.not.be.ok();
    expect(spy.args[0][1]).to.eql(greek);
  };

  var checkLonely = function(resp) {
    expect(spy.called).to.not.be.ok();
    expect(responses).to.have.length(resp);
  };

  var checkSad = function() {
    expect(spy.called).to.be.ok();
    expect(spy.calledOnce).to.be.ok();
    expect(spy.args[0].length).to.be.within(1, 2);
    expect(spy.args[0][0]).to.equal(error);
    if (spy.args[0].length === 2)
      expect(spy.args[0][1]).to.not.be.ok();
  };

  it('should complete on success', function() {
    run([null, greek]);
    checkHappy();
  });

  // check argument behavior
  describe('arguments', function() {
    var theArgs;

    beforeEach(function() {
      theArgs = [];
      respond = function() {
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        theArgs.push(args);
      };
    });

    var checkArgs = function() {
      expect(theArgs.length).to.be.above(0);
      for (var i = 0; i < theArgs.length; i++)
        expect(theArgs[i]).to.eql(['a', 'b', 'c']);
    };

    it('should work with options', function() {
      responses = [];
      var backoff = nicely.intently(testOptions);
      backoff(spy, respond, 'a', 'b', 'c');
      checkArgs();
    });

    it('should work with options, callback', function() {
      responses = [];
      var backoff = nicely.intently(testOptions, spy);
      backoff(respond, 'a', 'b', 'c');
      checkArgs();
    });

    it('should work with options, callback, function', function() {
      responses = [];
      nicely.intently(testOptions, spy, respond, 'a', 'b', 'c');
      checkArgs();
    });
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
      backoff(respond);
      checkLonely(1);
      clock.tick(100);
      checkHappy();
      spy.reset();
      responses = [[error], [null, greek]];
      backoff(respond);
      checkLonely(1);
      clock.tick(100);
      checkHappy();
    });
  });
});
