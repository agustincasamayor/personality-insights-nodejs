/**
<<<<<<< HEAD
 * Copyright 2015-2016 IBM Corp. All Rights Reserved.
=======
 * Copyright 2015 IBM Corp. All Rights Reserved.
>>>>>>> 36436c6fdccf4cf88b225adbe499d114cbfab103
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';


var cookieSession = require('cookie-session');
var appInfo = require('./app-info');
var hours = require('../utilities/milliseconds-from').hours;
var extend = require('underscore').extend;

module.exports = function (options) {
  return cookieSession(extend({
    name   : 'express.session',
    keys   : [ 'user' ],
    resave : true,
    saveUninitialized: true,
    overwrite: true,

    domain    : appInfo.domain,
    path      : '/',
    secure    : appInfo.secure,
    httpOnly  : appInfo.secure,
    signed    : false,
    maxAge    : hours(1),
    expires   : new Date(Date.now() + hours(1))

  }, options));
};
