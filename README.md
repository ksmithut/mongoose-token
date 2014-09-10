# mongoose-token

[![NPM version](http://img.shields.io/npm/v/mongoose-token.svg?style=flat)](https://www.npmjs.org/package/mongoose-token)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/mongoose-token.svg?style=flat)](https://gemnasium.com/ksmithut/mongoose-token)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/mongoose-token.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-token)
[![Build Status](http://img.shields.io/travis/ksmithut/mongoose-token.svg?style=flat)](https://travis-ci.org/ksmithut/mongoose-token)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/ksmithut/mongoose-token.svg?style=flat)](https://codeclimate.com/github/ksmithut/mongoose-token)

A mongoose plugin to generate a token that has an expiration.

# Usage

```javascript
'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var MySchema = new Schema({});

MySchema.plugin(require('mongoose-token'));
```

To pass in options:

```javascript
MySchema.plugin(require('mongoose-pass'), {});
```

# Options
