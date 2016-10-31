#!/usr/bin/env node

var Fs = require('fs');
var Path = require('path');
var dbconfig = require('../config/dbconfig');
var DbCrawler = require('../index');
var Commander = require('commander');
var SakilaFkpk = require('../test/sakila/sakila_fkpk');
var CrawlerParser = require('../lib/parser');
var PATH_TO_PACKAGE_JSON = Path.join(__dirname, '../package.json');
var DataUtils = require('../utils/data_utils');

/**
 * input will be of the form
 * select from newTable using data from oldTable
 * selectTable.selectColumn=fromTable.fromColumn
 * eg. actor_info.actor_id=actor.actor_id
 */
function parseConstraints(input) {
    try {
        var constraintParser = CrawlerParser.getConstraintParser();
        var finalConstraintData = {};
        finalConstraintData.constraint = constraintParser.parse(input) || []; // to allow giving empty constraints
        return finalConstraintData;
    } catch (e) {
        console.log('constraints can not be parsed', e)
        process.exit(1);
    }
}

/**
 * seed should be of the form
 * "table1.column1=1,2,3,4;table2.column2=2,5,7,8"
 */
function parseSeed(input) {
    try {
        var constraintParser = CrawlerParser.getSeedParser();
        var seedData = constraintParser.parse(input);
        return seedData;
    } catch (e) {
        console.log('unable to parse seed data');
        process.exit(2);
    }
}

function finalExit(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    process.exit(0);
}

//todo
//1)commander support for cli input
//2)meta data for merchant payout
//3)seed object as well as array support
(function () {
    if (require.main == module) {
        var pckgJson = JSON.parse(Fs.readFileSync(PATH_TO_PACKAGE_JSON, 'utf8'));
        Commander
            .version(pckgJson.version)
            .option('-h --host <string>', 'host where database has to be accessed', String)
            .option('-u --user <string>', 'database user', String)
            .option('-d --database <string>', 'database which is to crawled', String)
            .option('-p --password <string>', 'password to database', String)
            .option('-c --constraints <value>', 'Constraint using which to crawl the database', parseConstraints)
            .option('-s --seed <value>', 'data with which to start the crawl,different seed seperated by semicolon', parseSeed)
            .option('-f --constraint_file <string>', 'import constraints from .json file.', String)
            .option('-o --output_file <string>', 'path of the file where to write the sql dump statements', String)
            .option('-P --port <string>', 'port on which to connect to database', Number)
            .parse(process.argv);

        var commandLineOptions = {};
        var dbParams = ['host', 'database', 'user', 'password', 'port'];
        ['host', 'database', 'user', 'password', 'constraints', 'seed', 'constraint_file', 'output_file', 'port'].forEach(function (key) {
            if (Commander[key]) {
                commandLineOptions[key] = Commander[key];
            }
        });
        var flag = 0,
            dbOptions = {};
        ['host', 'database', 'user', 'password', 'seed'].forEach(function (eachParam) {
            if (!commandLineOptions[eachParam]) {
                finalExit('["host", "database", "user", "password", "seed"] are mandatory params');
            } else {
                dbOptions[eachParam] = commandLineOptions[eachParam];
            }
        });
        if (commandLineOptions.port) {
            dbOptions.port = commandLineOptions.port;
        }
        var options = {
            dbconfig: flag ? dbconfig : dbOptions,
            queryFileName: commandLineOptions.output_file || '/tmp/dbcrawler.sql',
            // noQuery:true,
            noData: true,
            seed: commandLineOptions.seed
        };
        var constraints;
        if (commandLineOptions.constraint_file) {
            constraints = require(Path.resolve(commandLineOptions.constraint_file));
        } else if (commandLineOptions.constraints) {
            constraints = commandLineOptions.constraints;
        } else {
            constraints = DataUtils.getSkeletonConstraints();
        }
        console.log("input = ", JSON.stringify(commandLineOptions, null, 4), "constraint = ", JSON.stringify(constraints, null, 4))
        DbCrawler.main(constraints, options, function (err, result) {
            console.log(err, result);
            finalExit();
        })
    }
})();

module.exports = DbCrawler;


/**
 * usage dbcrawler  -u "palash" -d "sakila" -h "localhost" -p "password" -c "actor_info.actor_id=actor.actor_id,film.film_id=film_actor.film_id"
 */