#!/usr/bin/env node
var Path = require('path');
var dbconfig = require('../config/dbconfig');
var DbCrawler = require('../index');
var Commander = require('commander');
var SakilaFkpk = require('../test/sakila/sakila_fkpk');

/**
 * input will be of the form
 * select from newTable using data from oldTable
 * selectTable.selectColumn=fromTable.fromColumn
 * eg. actor_info.actor_id=actor.actor_id
 */
function parseConstraints(input){
    try{
	var constraintStrings = input.split(',');
	var finalConstraintData={};
	finalConstraintData.constraint=[];
	var temp={};
	var newTable,oldTable;
	var eachConsData;
	constraintStrings.forEach(function (eachCons){
	    temp={};
	    eachConsData=eachCons.split('=');
	    newTable=eachConsData[0];
	    oldTable=eachConsData[1];
	    oldTable=oldTable.split('.');
	    newTable=newTable.split('.');
	    temp.referenced_table_name=newTable[0];
	    temp.referenced_column_name=newTable[1];
	    temp.table_name=oldTable[0];
	    temp.column_name=oldTable[1];
	    finalConstraintData.constraint.push(temp);
	});
	return finalConstraintData;	
    }catch(e){
	console.log('constraints can not be parsed')
	process.exit(1);
    }
}

/**
 * seed should be of the form
 * "table1.column1=1,2,3,4;table2.column2=2,5,7,8"
 */
function parseSeed(input){
    try{
	var seedString=input.split(';');
	var seedData=[];
	var tableName,columnName,values,temp={},tableData;
	var seedTemp={};
	seedString.forEach(function  (eachSeed){
	    temp={};
	    seedTemp=eachSeed.split('=');
	    tableData=seedTemp[0].split('.');
	    values=seedTemp[1];
	    tableName=tableData[0];
	    columnName=tableData[1];
	    values=values.split(',');
	    temp.table=tableName;
	    temp.result ={};
	    temp.result.value=values;
	    temp.result.column=columnName;
	    seedData.push(temp);
	});
	return seedData;
    }catch(e){
	console.log('unable to parse seed data');
	process.exit(2);
    }
}

//todo
//1)commander support for cli input
//2)meta data for merchant payout
//3)seed object as well as array support
(function () {
    if (require.main == module) {
	var defaultSeed = [{
		table: 'actor',
		result: [{
		    column: 'actor_id',
		    value: 1
		}]
	    }];
	Commander
	    .version('0.0.1')
	    .option('-h --host <string>','host where database has to be accessed',String,'localhost')
	    .option('-u --user <string>','database user',String,'palash')
	    .option('-d --database <string>','database which is to crawled',String,'sakila')
	    .option('-p --password <string>','password to database',String,'password')
	    .option('-c --constraints <value>','Constraint using which to crawl the database',parseConstraints)
	    .option('-s --seed <value>','data with which to start the crawl,different seed seperated by semicolon',parseSeed)
	    .option('-f --constraint_file <string>','import constraints from .json file.',String)
	    .option('-o --output_file <string>','path of the file where to write the sql dump statements',String)
	    .parse(process.argv);

	var commandLineOptions = {};
	var dbParams = ['host','database','user','password'];
	['host','database','user','password','constraints','seed','constraint_file','output_file'].forEach(function (key){
	    if(Commander[key]){
		commandLineOptions[key]=Commander[key];
	    }
	});
	var flag=0,dbOptions={};	
	['host','database','user','password'].forEach(function (eachParam){
	    if(!commandLineOptions[eachParam]){
		flag=1;
	    }else{
		dbOptions[eachParam]=commandLineOptions[eachParam];
	    }
	});
	var options={
	    dbconfig:flag?dbconfig:dbOptions,
	    queryFileName: commandLineOptions.output_file || '/tmp/dbcrawler.sql',
	    // noQuery:true,
	    noData:true, 
	    seed: commandLineOptions.seed || defaultSeed
	};
	var constraints ;
	if(commandLineOptions.constraint_file){
	    constraints=require(Path.resolve(commandLineOptions.constraint_file));
	}else if(commandLineOptions.constraints){
	    constraints=commandLineOptions.constraints;
	}else{
	    console.log('using default sakila database constraints');
	    constraints=SakilaFkpk;
	}
	console.log("input = ",JSON.stringify(commandLineOptions,null ,4),"constraint = ",JSON.stringify(constraints,null,4))
	DbCrawler.main(constraints,options,function (err,result){
	    console.log(err,result);
	})
    }
})();

module.exports=DbCrawler;


/**
 * usage dbcrawler  -u "palash" -d "sakila" -h "localhost" -p "password" -c "actor_info.actor_id=actor.actor_id,film.film_id=film_actor.film_id"
*/
