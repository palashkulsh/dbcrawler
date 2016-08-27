/* jslint node: true */
'use strict';

var fs=require('fs');
var util = require('util');
var async = require('async');
var assert = require('assert');
var mysqlcon=require('./mysqlcon');
var generateSchema = require('./generate_schema');
var dbconfig = require('./config/dbconfig');
var DataUtils = require('./utils/data_utils');
var INSERT_STATEMENT_LIMIT = 20;

function deepEqual(a, b) {
    try {
	assert.deepEqual(a, b);
	return true;
    } catch (AssertionError) {
	return false;
    }
}

/***
 *uses table name from data
 *pushes new table references into input
 *uses values for filters from result
 *finally calls callback
 */
function getRecursionInput(metadata,data, result, cb) {
    var fkpk=metadata.constraints;
    if (!result || !result.length) {
	return cb(null, []);
    }
    var newinput = [];
    var element = {};
    var alreadyPresent = false;
    //for all the results
    result.forEach(function (eachResult) {
	//check all the foreign key primary key constraints
	fkpk.constraint.forEach(function (eachConst) {
	    //create new seed for dbcrawler
	    if (eachConst.table_name === data.table && eachResult[eachConst.column_name]) {
		//seed for dbcrawler
		element = {
		    table: eachConst.referenced_table_name,
		    result: [{
			column: eachConst.referenced_column_name,
			value: eachResult[eachConst.column_name]
		    }],
		};
		alreadyPresent = false;
		if(result.lengt<1000){
		    newinput.forEach(function (input) {
			if (deepEqual(input, element)) {
			    alreadyPresent = true;
			}
		    });
		}
		if (!alreadyPresent) {
		    newinput.push(element);
		}
	    } //ends if eachConst
	}); //ends fkpk.constraint.Foreach
    }); //ends resultForEach
    return cb(null, newinput);
}

function pushQuery(options,metadata,table,result,finalQuery,cb) {
    var insertQuery = table.insert(result).toQuery();
    if (!insertQuery || !insertQuery.values || !insertQuery.values.length) {
	return ;
    }
    //remove the columns which you donot want to insert
    var newResult = removeIgnoreColumns(metadata,table, result);
    var newResultSet = DataUtils.splitArrayToMultipleArray(newResult,INSERT_STATEMENT_LIMIT);
    //instead of making insert statement with all the results at one time
    //make multiple insert statements with only bunch of data at sigle time
    async.eachSeries(newResultSet,function (eachResultSet,callback){
	insertQuery = table.insert(eachResultSet).toString();
	//pushToArray(finalQuery,insertQuery,table._name);
	fs.appendFile(options.queryFileName,insertQuery,callback);
    },function(){
	return cb();
    });
}

function getData(options,metadata,finalData,finalQuery,data, cb) {
    var schema=metadata.schema;
    var filters = [];
    if (!data.table) {
	return cb(new Error('No table specified'));
    }
    var table = schema[data.table];
    //setting name so that can be used later to retrieve table details
    table._name = data.table;
    if (!table) {
	return cb(new Error('Invalid table specified'));
    }
    var selects = table.star();
    if(data.result && !util.isArray(data.result)){
	data.result=[data.result];
    }
    data.result.forEach(function (row) {
	if(util.isArray(row.value)){
	    filters.push(table[row.column].in(row.value));
	}
	else{
	    filters.push(table[row.column].equals(row.value));
	}
    });
    var query = table.select(selects).from(table);
    query = query.where.apply(query, filters);
    mysqlcon.exec(query.toString(),metadata.dbconfig,function (err, result) {
	if (err) {
	    return cb(err);
	}	
	result.forEach(function (eachRes) {
	    Object.keys(eachRes).forEach(function (eachKey) {
		//formatting date because date comes in non consumable form
		if (typeof (eachRes[eachKey]) === 'object' && Number(Date.parse(eachRes[eachKey]))) {
		    eachRes[eachKey] = new Date(Date.parse(eachRes[eachKey])).toISOString().substr(0, 10);
		}
	    });
	});
	pushToArray(finalData,result,table._name);
	//now using results of previous select query to get insert statement for the given table
	getRecursionInput(metadata,data, result, function (err, pushThese) {
	    if(err){
		return cb(err);
	    }
	    if(!metadata.noQuery){
		pushQuery(options,metadata,table,result,finalQuery,function (){
		    return cb(null, pushThese);
		});		
	    }else{
		return cb(null, pushThese);
	    }
	}); //ends getRecursionInput
    }); //ends query.exec
}

//removes the columns which are not to be inserted from result into table
function removeIgnoreColumns(metadata,table, result) {
    var fkpk=metadata.constraints;
    if (!fkpk.insert || !fkpk.insert || !fkpk.insert.ignore || !table._name || !result || !result.length) {
	return result;
    }
    var removeTheseCol = fkpk.insert.ignore[table._name];
    if(!removeTheseCol){
	return result;
    }
    //copy the data which is to be inserted
    var newResult = JSON.parse(JSON.stringify(result));
    //remove ignore columns from each result
    newResult.forEach(function (eachRes) {
	Object.keys(eachRes).forEach(function (k) {
	    if (removeTheseCol.indexOf(k) >= 0) {
		delete eachRes[k];
	    }
	});
    });
    return newResult;
}

/**
 * items.table {string} table : name of the table whose values is to be used as a seed
 * items.result {object}  
 */
function recursivePush(metadata,items, q, cb) {
    // if (!items || !items.length) {
    // 	return cb(new Error('no items to be pushed in queue'));
    // }
    items.forEach(function (item) {
	//whenever item is pushed into queue getData runs 
	//getData returns err and pushThese (new elements to be pushed into queue) 
	//when new elements are pushed then getData runs again. Hence its recursive
	q.push(item, function (err, pushThese) {
	    if(err){
		return cb(err);
	    }
	    recursivePush(metadata,pushThese, q, function (err) {
		return cb(err);
	    });
	});
    });
}

function pushToArray(finalData,data,tableName){
    if(!finalData[tableName]){
	finalData[tableName]=[];
    }
    if(util.isArray(data)){
	finalData[tableName].push.apply(finalData[tableName],data);
    }else{
	finalData[tableName].push(data);
    }
    return;
}

function crawl(options,schema,constraints,callback){
    /**
     * first table and its column values
     * select from first seed table and values
     * refer to fkpk constraint data and check which table references to the given table
     * create new filter consisting of values from first table as filter for referencing table
     * then select from referencing table and use  values as filters for its referencing table
     * repeat the process untill no referencing table is found for given table
     */
    //getData is called whenver an item is pushed into queue
    var finalData={};
    var finalQuery={};
    var metadata={
	schema:schema,
	constraints: constraints,
	dbconfig:options.dbconfig	
    };
    var q = async.queue(getData.bind(null,options,metadata,finalData,finalQuery));
    //seed for dbcrawler to start
    var input = options.seed;
    recursivePush(metadata,input, q, function (err) {
	util.log(err);
	console.log('some error occured',err);
    });
    //when there is no element in the queue
    q.drain = function () {
	console.log('all items processed');	
	//console.log(finalData)
	return callback(null,finalData,finalQuery);
    };    
}

function writeToFile(data,filename,cb){
    fs.writeFileSync(filename,'');
    Object.keys(data).forEach(function  (d){
	data[d].forEach(function (q){
	    fs.appendFileSync(filename,q);
	    fs.appendFileSync(filename,';\n');	     	    
	});
    });
    return cb(null,filename);
}


/**
   options {object}
   options.dbconfig
   options.queryFileName
   options.noQuery
   options.noData
*/

function main(fkpk,options,cb){
    //initializations
    options.queryFileName = options.queryFileName || '/tmp/query.sql';

    async.waterfall([
	async.constant(fkpk,options),
	function (fkpk,opts,callback){
	    fs.writeFile(opts.queryFileName,'',function (err){
		if(err){
		    util.log('unable to initiate file write');
		    return callback(err);
		}
		return callback(null,fkpk,opts);
	    });
	},
	function(fkpk,opts,callback){
	    var opts={
		dbconfig:options.dbconfig	
	    };
	    generateSchema.generate(opts,function(err,result){
		if(err){
		    return callback(err);
		}
		var newErr,schema;
		try{
		    schema = require(result.file);
		    if(!schema){
			newErr=new Error('empty auto generated schema file found ');
		    }
		}catch(e){
		    newErr=new Error('not able to read generated schema file '+e);
		}
		finally{
		    return callback(newErr,options,fkpk,schema);
		}		
	    });	    
	},
	function(options,fkpk,schema,callback){
	    var opts={
		noQuery:options.noQuery ,		
	    };
	    crawl(options,schema,fkpk,function (err,finalData,finalQuery){		
		async.parallel({
		    query: function(callback){
			fs.exists(options.queryFileName,function (exists){
			    if(exists){
				return callback(null,options.queryFileName);
			    }else{
				return callback(null,'');
			    }
			});
		    },
		    data: function(callback){
			if(options.noData){
			    return callback(null,null);
			}
			else{
			    return callback(null,finalData);
			}
		    }
		},function(err,result){
		    return callback(err,result);
		});
	    });	    
	}
    ],cb);
}

module.exports={
    main:main
};

//todo
//1)commander support for cli input
//2)meta data for merchant payout
//3)seed object as well as array support
(function () {
    if (require.main == module) {
	var fkpk = require('./test/sakila/sakila_fkpk');
	var options={
	    dbconfig:dbconfig,
	    queryFileName:'/tmp/palash.sql',
	    // noQuery:true,
	    noData:true, 
	    seed:[{
		table: 'actor',
		result: [{
		    column: 'actor_id',
		    value: 1
		}]
	    }]
	};
	main(fkpk,options,function (err,result){
	    console.log(err,result);
	})
    }
})();
