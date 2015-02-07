module.exports = function (db) {
  var lock = {};

  db.serial = function (key, callback) {
    var key_lock = lock[key];

    if (key_lock) {
      key_lock.push(callback);
      return;
    }

    key_lock = lock[key] = [];

    function unlock () {
      var next = key_lock.shift();
      if (!next) {
        delete lock[key];
        return;
      }
      get(next);
    }

    function get (callback) {
      db.get(key, function (err, value) {
        callback(err, value, unlock);
      });
    }

    get(callback);
  };

  return db;
};