var levelup = require('levelup');
var serial = require('./..');
var assert = require('assert');
var rimraf = require('rimraf');
var db_file = __dirname + '/testdb';

try {
  rimraf.sync(db_file);
}catch(er){ }

var db = levelup(db_file, {
  valueEncoding: 'json'
});

db = serial(db);

//example implementation of inc
db.inc = function(key, value, cb) {
  db.serial(key, function (err, current, unlock) {
    var new_value = (current || 0) + value;
    db.put(key, new_value, function (err) {
      unlock();
      if (cb) cb(err);
    });
  });
};

describe('level-serial', function () {
  it('should work', function (done) {
    var times = 0;

    function incremented(err) {
      if (err) return done(err);
      times += 1;
      if (times < 100) return;

      db.get('b', function(err, val) {
        if (err) return done(err);
        assert.equal(val, 500);
        done();
      });
    }

    for (var i = 0; i < 100; i += 1) {
      db.inc('b', 5, incremented);
    }
  });
});