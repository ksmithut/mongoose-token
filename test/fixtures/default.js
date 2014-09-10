'use strict';

var mongoose = require('mongoose');
var token    = require('../../index');
var Schema   = mongoose.Schema;

var TestSchema = new Schema({
  username: String
});

TestSchema.plugin(token);

module.exports = mongoose.model('Test', TestSchema);
