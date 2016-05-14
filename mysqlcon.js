var mysql      = require('mysql');
var dbconfig = require('./config/dbconfig');
/** 
    create new connection every and end it after the query
    other wise it may leave opened connections after dbcrawler has stopped
*/
function exec(query,cb){
    var connection = mysql.createConnection(dbconfig);
    connection.query(query, function(err, rows, fields) {
	connection.end();
	if (err) { 
	    return cb(err);
	};
	return cb(err,rows);
    });        
}

module.exports={exec:exec};

(function(){
    if(require.main===module){
	exec('select * from merchant_payout',function(err,rows,fields){
	    console.log(arguments);
	})
    }
})()
