# dbcrawler
crawls database and makes insert statement for all the tables so that some data can be taken from all tables
input consists of multiple parts
1)constraints according to which data has to be extracted or crawled from the database
the format of this file consists of
```var data={constraint:
 [
  {table_name:"actor",column_name:"actor_id",referenced_table_name:"actor_info",referenced_column_name:"actor_id"},
  {table_name:"film_actor",column_name:"film_id",referenced_table_name:"film",referenced_column_name:"film_id"}, 
  {table_name:"actor",column_name:"actor_id",referenced_table_name:"film_actor",referenced_column_name:"actor_id"}, 
 ]
};
module.exports=data;
```
2)Following information about database is required to access the database dbconfig
	    -user
	    -database
	    -password
	    -host



     	var options={
	    dbconfig:{
	    user:root,
	    password:'pass',
	    database:'database name',
	    host:'localhost'
	    },
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


Format of seed data
1) array of table and required filter on it.
2)result consists of array of filters which are anded to one another


More detailed docs are being created . New hero is getting ready