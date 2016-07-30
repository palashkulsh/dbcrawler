#!/usr/bin/env node
var dbconfig = require('../config/dbconfig');
var DbCrawler = require('../index');

//todo
//1)commander support for cli input
//2)meta data for merchant payout
//3)seed object as well as array support
(function () {
    if (require.main == module) {
	var fkpk = require('../test/sakila/sakila_fkpk');
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
	DbCrawler.main(fkpk,options,function (err,result){
	    console.log(err,result);
	})
    }
})();

module.exports=DbCrawler;
