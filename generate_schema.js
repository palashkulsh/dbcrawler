var generateSqlDefinition = require('sql-generate')
var dbconfig=require('./config/dbconfig');
var Path = require('path');

function generateSchema(options,cb){
    var usingConfig = options.dbconfig || dbconfig;
    var filename=usingConfig.database+'_schema.js';
    var prepend='';
    if(options.generatePath){
	prepend=options.generatePath;
    }
    else{
	prepend='auto_gen';
    }
    var filepath=Path.join(__dirname,prepend,filename);
    var options={
	dsn:'mysql://'+usingConfig.user+':'+usingConfig.password+'@'+usingConfig.host+'/'+usingConfig.database,
	outputFile:filepath,
	dialect:'mysql',
	append:"sql.setDialect('mysql');",
    };
    generateSqlDefinition(options,function (err,stats){
	if (err) {
            return cb(err);
	}
	var returnOpts={
	    file:filepath
	};
	return cb(err,returnOpts);
    });
}

module.exports={
    generate:generateSchema
};

(function(){
    if(require.main==module){
	generateSchema({},function (err,stats){
	    console.log(stats)
	});
    }
})();
