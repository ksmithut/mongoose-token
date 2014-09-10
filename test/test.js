'use strict';
/* global describe, before, beforeEach, after, afterEach, it */
/* jshint maxlen: false */

var expect   = require('expect.js');
var mongoose = require('mongoose');

describe('mongoose-token', function () {
  // Connect to the database
  before(function (done) {
    mongoose.connect('mongodb://127.0.0.1/mongoose-token-test', done);
  });

  // Delete the database after testing
  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  // Level 1 tests
  describe('Level 1', function () {

    it('should hash the password when a new model is saved', function (done) {
      var TestModel = require('./fixtures/default');
      done();
    });

  });
});
