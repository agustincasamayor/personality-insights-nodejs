/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
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


var session = require('express-session');
var _ = require('underscore');
var extend = _.extend;
var isUndefined = _.isUndefined;
var env = require('cfenv').getAppEnv();
var logger = require('winston');


function databaseSessionAvailable() {
  return !isUndefined(env.getService('Cloudant')) && env.getService('Cloudant') != null;
}

function storeOptions() {
  return { url: env.getServiceCreds('cloudant').url };
}

function databaseSession(options) {
  var CloudantStore = require('connect-cloudant')(session);
  var cloudantStore = new CloudantStore(extend(storeOptions(), options));

  cloudantStore.on('connect', function () { return logger.debug('Cloudant session store is ready for use'); });
  cloudantStore.on('disconnect', function () { return logger.debug('An error occurred connecting to Cloudant Session Storage'); });

  return session( extend({}, options, { store: CloudantStore }) );
}

module.exports = function (options) {
  var _session;
  if (databaseSessionAvailable()) {
    _session = databaseSession(options)
    logger.info('Using database based session');
  } else {
    _session = session(options);
    logger.info('Using memory based session');
  }
  return _session;
};
