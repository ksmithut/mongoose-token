# mongoose-token

[![NPM version](http://img.shields.io/npm/v/mongoose-token.svg?style=flat)](https://www.npmjs.org/package/mongoose-token)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/mongoose-token.svg?style=flat)](https://gemnasium.com/ksmithut/mongoose-token)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/mongoose-token.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-token)
[![Build Status](http://img.shields.io/travis/ksmithut/mongoose-token.svg?style=flat)](https://travis-ci.org/ksmithut/mongoose-token)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/ksmithut/mongoose-token.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-token)

A mongoose plugin to generate a token that has an expiration. Especially useful
when generating an expiring token used for password resets.

# Usage

```javascript
'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Obviously, you'd want more robust way of handling user authentication.
// Still need password hashing, and all that fun stuff.
var UserSchema = new Schema({
  email: String,
  password: String
});

UserSchema.plugin(require('mongoose-token'));

UserSchema.static('requestPasswordReset', function (email) {
  this.findOne({email: email}).exec().then(function (user) {
    if (!user) { return false; }
    return user.setToken();
  });
});

UserSchema.static('resetPassword', function (token, email, newPassword) {
  this.getByToken(token, {email: email}).then(function (user) {
    if (!user) { return false; }
    user.password = newPassword;
    return user.resetToken();
  });
});
```

So the things that this plugin adds:

`document.setToken([cb])` - Sets the token and token expiration. You may pass in
a callback (which accepts an error and the newly saved model) and it returns a
promise.

`document.resetToken([cb])` - Resets the token and token expiration. You may
pass in a callback (which accepts an error and the newly saved model) and it
returns a promise.

`Model.getByToken(token[, query][, cb])` - Gets a document by the given token
(and additional search parameters) if the token hasn't expired. The query and
callback parameters are optional. You may pass in the callback as the second
parameter if you don't have a query parameter. Also returns a promise.

Examples of the above methods in use are in the above example.

You may also set multiple tokens with multiple resets. Just call the `.plugin`
method again and pass in different options for the property and method names.
See options below.

To pass in options:

```javascript
UserSchema.plugin(require('mongoose-token'), {
  tokenPath   : 'token',
  expiresPath : 'tokenExpires',
  setMethod   : 'setToken',
  getByMethod : 'getByToken',
  resetMethod : 'resetToken',
  tokenLength : 20,
  expire      : 1 * 60 * 60 * 1000 // 1 hour
);
```

# Options

* `tokenPath` (String) - The path to the token property. Default: `'token'`
* `expiresPath` (String) - The path to the token expiration property. Default:
  `'tokenExpires'`
* `setMethod` (String) - The name of the method that sets the token. Default:
  `'setToken'`
* `getByMethod` (String) - The name of the method that gets the model by the
  given token. Default: `'getByToken'`
* `resetMethod` (String) - The name of the method that resets the token and
  token expiration. Default: `'resetToken'`
* `tokenLength` (Number) - The length of the token string. Default: `20`
* `expire` (Number) - The number of milliseconds the token is valid for.
  Default: `1 * 60 * 60 * 1000` or 1 hour
