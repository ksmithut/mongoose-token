'use strict';

var Promise  = require('bluebird');
var defaults = require('lodash.defaults');
var crypto   = Promise.promisifyAll(require('crypto'));

module.exports = function createdAt(schema, options) {
  // http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/

  // Set the default options
  options = options || {};
  defaults(options, {
    tokenPath   : 'token',
    expiresPath : 'tokenExpires',
    setMethod   : 'setToken',
    getByMethod : 'getByToken',
    resetMethod : 'resetToken',
    tokenLength : 20,
    expire      : 1 * 60 * 60 * 1000 // 1 hour
  });

  // Set the path options
  schema
    .path(options.tokenPath, String)
    .path(options.expiresPath, Number);

  // This is the setToken method.
  //
  // It creates a token made from random bytes using the crypto module. Could
  // be convinced to use another module instead
  schema.method(options.setMethod, function (cb) {
    var model = this;
    return crypto.randomBytesAsync(options.tokenLength / 2)
      .then(function (buf) {
        model.set(options.tokenPath, buf.toString('hex'));
        model.set(options.expiresPath, Date.now() + options.expire);
        return saveAsync(model);
      })
      .nodeify(cb);
  });

  // This is the resetToken method.
  //
  // It resets the tokenPath and expiresPath to undefined, then saves the model.
  schema.method(options.resetMethod, function (cb) {
    var model = this;
    model.set(options.tokenPath, undefined);
    model.set(options.expiresPath, undefined);
    // I decided to use the .save method instead of the update method because
    // I found I wanted to use this method in conjuction with updating other
    // properties before this.
    return saveAsync(model).nodeify(cb);
  });

  // This is the getMethod static method.
  //
  // Gets a document by the given token (with additional optional query), as
  // long as the token hasn't expired.
  schema.static(options.getByMethod, function (token, query, cb) {
    if (typeof query === 'function') {
      cb = query;
      query = null;
    }
    query = query || {};
    query[options.tokenPath] = token;
    query[options.expiresPath] = {$gt: Date.now()};

    if (typeof cb === 'function') {
      this.findOne(query, cb);
    } else {
      return this.findOne(query).exec();
    }
  });

};

// With the save, it doesn't return a promise, so there's that. No
// support for promises on the save until 4.0
// https://github.com/LearnBoost/mongoose/issues/1431
function saveAsync(doc) {
  return new Promise(function (resolve, reject) {
    doc.save(function (err, doc) {
      /* istanbul ignore if: This should handle errors just fine */
      if (err) { return reject(err); }
      resolve(doc);
    });
  });
}

