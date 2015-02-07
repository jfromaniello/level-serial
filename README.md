in-memory serialization of operations over a level-db key.

Similar tools: [level-lock](https://github.com/substack/level-lock), [level-updater](https://github.com/hughsk/level-updater).

## Installation

~~~
npm install level-serial --save
~~~

## Usage

level-serial adds a new method to the levelup db object **serial**

**db.serial** is like **db.get** but serialized until the resource is **released**.

~~~javascript
var db = levelup(db_file, {
  valueEncoding: 'json'
});

db = serial(db);

db.serial('thing', function (err, value, release) {
  value['foo'] = 123;
  db.put('thing', value, release);
});

db.serial('thing', function (err, value, release) {
  value['foo'] = 456;
  db.put('thing', value, release);
});
~~~

## inc example

~~~javascript
db.inc = function(key, value, cb) {
  if (typeof value === 'function') {
    cb = value;
    value = 1;
  }
  if (!cb) {
    cb = function(){};
  }
  db.serial(key, function (err, current, release) {
    var new_value = (current || 0) + value;
    db.put(key, new_value, function (err) {
      release();
      if (err) {
        return cb(err);
      }
      cb(null, new_value);
    });
  });
};

db.inc('foo', 1);
db.inc('foo', 1);
db.inc('foo', 1, function (err, value) {
  console.log('value is ', value); //always 3.
});
~~~

## License

MIT 2014 - José F. Romaniello