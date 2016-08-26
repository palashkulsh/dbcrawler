var generateSqlDefinition = require('sql-generate')
var dbconfig = require('./config/dbconfig');
var Path = require('path');
var Async = require('async');
var Fs = require('fs');

/////////////////////////////////////////////////////////
//functions used in generate schema water fall starts here
function setPath(options, callback) {
    var usingConfig = options.dbconfig || dbconfig;
    var filename = usingConfig.database + '_schema.js';
    if (options.generatePath) {
        directory = options.generatePath;
    } else {
        directory = 'auto_gen';
    }
    var location = Path.join(__dirname, directory);
    var filepath = Path.join(__dirname, directory, filename);
    //generate in autogen directory
    // if that fails then generate in system tmp directory
    Fs.exists(location, function (exists) {
        if (!exists) {
            directory = '/tmp/';
            location = Path.join(directory);
            Fs.exists(location, function (exists) {
                if (!exists) {
                    return callback('not able to find a suitable path to write auto gen schema file');
                } else {
                    var filepath = Path.join(directory, filename);
                    return callback(null, filepath, options);
                }
            });
        } else {
            return callback(null, filepath, options);
        }
    });
}

function actuallyGenerateSchema(filepath, options, callback) {
    var usingConfig = options.dbconfig || dbconfig;
    var opts = {
        dsn: 'mysql://' + usingConfig.user + ':' + usingConfig.password + '@' + usingConfig.host + '/' + usingConfig.database,
        outputFile: filepath,
        dialect: 'mysql',
        append: "sql.setDialect('mysql');",
    };
    generateSqlDefinition(opts, function (err, stats) {
        if (err) {
            return callback(err);
        }
        var returnOpts = {
            file: filepath
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
        setPath,
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