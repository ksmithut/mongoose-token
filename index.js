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
    resetMethod : 'setToken',
    tokenLength : 20,
    expire      : 1 * 60 * 60 * 1000
  });


  schema
    .path(options.tokenPath, String)
    .path(options.expiresPath, Number);


  schema.method(options.setMethod, function (cb) {
    var model = this;
    var token;
    var createToken = crypto.randomBytesAsync(options.tokenLength)
      .then(function (buf) {
        token = buf.toString('hex');
        var set = {};
        set[options.tokenPath] = token;
        set[options.expiresPath] = Date.now() + options.expire;
        return model.update({$set: set}).exec();
      })
      .then(function () {
        return token;
      });

    if (typeof cb === 'function') {
      createToken.then(function (token) {
        cb(null, token);
      }, cb);
    } else {
      return createToken;
    }
  });


  schema.method(options.resetMethod, function (cb) {
    var model = this;
    model.set(options.tokenPath, undefined);
    model.set(options.expiresKey, undefined);
    // I decided to use the .save method instead of the update method because
    // I found I wanted to use this method in conjuction with updating other
    // properties before this.
    //
    // Also, with the save, it doesn't return a promise, so there's that. No
    // support for promises on the save until 4.0
    // https://github.com/LearnBoost/mongoose/issues/1431
    var update = new Promise(function (resolve, reject) {
      model.save(function (err) {
        if (err) { return reject(err); }
        resolve();
      });
    });

    if (typeof cb === 'function') {
      update.then(function (token) {
        cb(null);
      }, cb);
    } else {
      return update;
    }
  });


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

