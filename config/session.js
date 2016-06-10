/**
 * Copyright 2015-2016 IBM Corp. All Rights Reserved.
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
var CloudantStore = require('connect-cloudant')(session);
var _ = require('underscore');
var extend = _.extend;
var contains = _.contains;
var pick = _.pick;
var isUndefined = _.isUndefined;
var env = require('cfenv').getAppEnv();
var logger = require('winston');
var Cloudant = require('cloudant');
var asPromise = require('../utilities/promises/callback-to-promise');

function databaseSessionAvailable() {
  return env.getService(/[cC]loudant/) != null;
}

function storeOptions() {
  return {
    url: env.getServiceCreds(/[cC]loudant/).url,
    databaseName: 'sessions'
  };
}

function withCloudant() {
  return new Promise(function (resolve, reject) {
    var credentials = env.getServiceCreds(/[cC]loudant/);
    Cloudant(
      {
        account : credentials.username,
        password : credentials.password
      },
      function (err, cloudant) {
        err ? reject(err) : resolve(cloudant);
      }
    );
  });
}

function listDbs(cloudant) {
  return asPromise(cloudant.db.list);
}

function dbExists(databaseName) {
  return function (databases) {
    return Promise.resolve(contains(databases, databaseName));
  };
}

function createDb(cloudant, databaseName) {
  return function() {
    return asPromise(cloudant.db.create.bind(cloudant, databaseName))
      .then(function() { logger.info('Created sessions database: \''+ databaseName +'\'.'); });
  };
}

function ifelse(fTrue, fFalse) {
  return function (bool) {
    return bool ? fTrue() : fFalse();
  };
}

function id(x) { return x; }

function initializeSessionDB(options) {
  withCloudant()
    .then(function(cloudant) {
      return listDbs(cloudant)
        .then(dbExists(options.databaseName))
        .then(ifelse(id, createDb(cloudant, options.databaseName)));
    });
}

function databaseSession(options) {
  var _options = extend(storeOptions(), options || {});
  var cloudantStore = new CloudantStore(_options);

  cloudantStore.on('connect', function () { return logger.debug('Cloudant session store is ready for use'); });
  cloudantStore.on('disconnect', function () { return logger.debug('An error occurred connecting to Cloudant Session Storage'); });

  initializeSessionDB(_options);

  return session( extend(_options, { store: cloudantStore }) );
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
