var generateSqlDefinition = require('sql-generate')
var dbconfig = require('./config/dbconfig');
var Path = require('path');
var Async = require('async');
var Fs = require('fs');
var RequireFromString = require('require-from-string')
/////////////////////////////////////////////////////////
//functions used in generate schema water fall starts here

function actuallyGenerateSchema(options, callback) {
  var usingConfig = options.dbconfig || dbconfig;
  var opts = {
    //dsn: 'mysql://' + usingConfig.user + ':' + usingConfig.password + '@' + usingConfig.host + '/' + usingConfig.database,
    dialect: 'mysql',
    append: "sql.setDialect('mysql');",
    omitComments: true,
    user: usingConfig.user,
    password: usingConfig.password,
    host: usingConfig.host,
    database: usingConfig.database
  };
  generateSqlDefinition(opts, function (err, stats) {
    if (err) {
      return callback(err);
    }
    if (!stats || !stats.buffer) {
      return callback(new Error('not able to generate schema'));
    }
    debugger
    var schema;
	  var o= { 
	    //passing prependPaths forces the module compilation in require from string function to find
	    //sql module in node_modules directory of dbcrawler
	    //this solves the problem of dbcrawler trying to find sql module when running globally
	    prependPaths:[Path.join(__dirname,'./node_modules')]
	  };
    try {
      schema = RequireFromString(stats.buffer.toString(),o);
    } catch (ex) {
      return callback(new Error('not able to parse schema file'));
    }
    var returnOpts = {
      data: schema
    };
    return callback(null, returnOpts);
  });
}

//functions used in generate schema water fall endss here
//////////////////////////////////////////////////////////

function generateSchema(options, cb) {
  var directory = '';
  Async.waterfall([
    Async.constant(options),
    actuallyGenerateSchema
  ], cb);
}

module.exports = {
  generate: generateSchema
};

(function () {
  if (require.main == module) {
    generateSchema({}, function (err, stats) {
      console.log(stats)
    });
  }
})();
