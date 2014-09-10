'use strict';
/* global describe, before, beforeEach, after, afterEach, it */
/* jshint maxlen: false */

var expect   = require('expect.js');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var token    = require('../index');
var Promise  = require('bluebird');

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

    it('should set the token', function (done) {
      var TestSchema = new Schema({
        name: String
      });
      TestSchema.plugin(token);
      var Test = mongoose.model('Test1', TestSchema);

      Test.create({name: 'test'})
        .then(function (model) {
          return model.setToken();
        })
        .then(function (model) {
          expect(model.token).to.be.ok();
          expect(model.token).to.have.length(20);
          expect(model.tokenExpires).to.be.ok();
          done();
        }, done);
    });


    it('should get a model by its token', function (done) {
      var TestSchema = new Schema({
        name: String
      });
      TestSchema.plugin(token);
      var Test = mongoose.model('Test2', TestSchema);
      var modelToken;

      Test.create({name: 'test2'})
        .then(function (model) {
          return model.setToken();
        })
        .then(function (model) {
          modelToken = model.token;
          return Test.getByToken(model.token, {name: 'test2'});
        })
        .then(function (model) {
          expect(model.token).to.be(modelToken);
          return model.resetToken();
        })
        .then(function (model) {
          expect(model.token).to.not.be.ok();
          expect(model.tokenExpires).to.not.be.ok();
        })
        .then(done, done);
    });


    it('should not get the model if the token expires', function (done) {
      var TestSchema = new Schema({
        name: String
      });
      TestSchema.plugin(token, {
        expire: 200
      });
      var Test = mongoose.model('Test3', TestSchema);
      var modelToken;

      Test.create({name: 'test3'})
        .then(function (model) {
          return model.setToken();
        })
        .then(function (model) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(model);
            }, 500);
          });
        })
        .then(function (model) {
          modelToken = model.token;
          return Test.getByToken(model.token, {name: 'test3'});
        })
        .then(function (model) {
          expect(model).to.not.be.ok();
        })
        .then(done, done);
    });


    it('should work with callbacks, too', function (done) {
      var TestSchema = new Schema({
        name: String
      });
      TestSchema.plugin(token);
      var Test = mongoose.model('Test4', TestSchema);
      var modelToken;

      Test.create({name: 'Test4'}, function (err, model) {
        if (err) { return done(err); }
        model.setToken(function (err, model) {
          if (err) { return done(err); }
          modelToken = model.token;
          Test.getByToken(model.token, function (err, model) {
            if (err) { return done(err); }
            expect(model.token).to.be(modelToken);
            model.resetToken(function (err, model) {
              if (err) { return done(err); }
              expect(model.token).to.not.be.ok();
              expect(model.tokenExpires).to.not.be.ok();
              done();
            });
          });
        });
      });
    });

  });
});
