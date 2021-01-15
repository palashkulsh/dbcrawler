# dbcrawler
The basic use of dbcrawler is to generate sql dump statements from tables in your database. It crawls the database using the information provided by the user.

For straightforward usecases you can use mysql dump but when you have requirement where 
order

    item `order.id=item.order_id`
    payment `order.id=payment.order_id`
    address `order.id=address.order_id`

now in this case you want to find all data from all tables corresponding to order.id

**This is the usecase where dbcrawler shines. collecting data from multiple table**

To install type - ```npm install -g dbcrawler ```

Basic usage: To test the basic usage

``` sh
dbcrawler  -u "palash" -d "sakila" -h "localhost" -p "password" -c "actor_info.actor_id=actor.actor_id,film.film_id=film_actor.film_id" -s "actor.actor_id=3" 
```

  ``` Usage: dbcrawler [options] ```

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -h --host <string>             host where database has to be accessed
    -u --user <string>             database user
    -d --database <string>         database which is to crawled
    -p --password <string>         password to database
    -c --constraints <value>       Constraint using which to crawl the database
    -i --ignore <string>           table.columns to ignore from insert generation
    -r --required <string>         only table.columns to be used for insert generation
    -s --seed <value>              data with which to start the crawl,different seed seperated by semicolon
    -f --constraint_file <string>  import constraints from .json file.
    -o --output_file <string>      path of the file where to write the sql dump statements

#### Usage options explained

###### -u user
User of the database which has permission to access the database. eg root,app etc.

######  -h host
Address where database is accessible. eg. localhost, 127.0.0.1 etc.

###### -d database
Database which is to be crawled . Eg sakila database in default example of this module. This sakila database can be downloaded from [here]: <https://dev.mysql.com/doc/index-other.html>

###### -p password
Password to access the database.

###### -c constraints
Constraints are just join conditions . Eg             ```actor_info.actor_id=actor.actor_id,film.film_id=film_actor.film_id``` . The format acceptible is table1.column1 = table2.column2 . What this means is that use values of column2 of table2 to retrieve values from table1.
   
###### -i ignore
Sometimes we don't want few columns to be present in our generated insert statements. For eg. when generating a new row with existing data we usually want to remove the primary key column from the insert statement. Igore option is just for that situation. 

  * **For eg.** if we don't want `id,created_at,updated_at` columns of table1 then we can provide the command line parameter

    > `-i "table1.id,table1.created_at,table1.updated_at"`

###### -r required
Sometimes we just want insert statements for few columns only. then we can provide tablename.column names separated by comma. 
  * **For eg.** if we only want `first_name,middle_name and last_name`  of table1 then we can provide the option

> `-r "table1.first_name,table1.middle_name,table1.last_name"`

###### -s  seed
Seed means the initial data that has to be given to crawler to start the crawl. For eg. ```actor.actor_id=3,4,5;film_actor.actor_id=5``` . Each seed consists of ```tableName.columnName=commaSeperatedValues``` . Each two seeds are seperated from each other using ```;``` as given in example above. Above seed will start from 2 points first from actor table using actor_id values 3,4,5 and from film_actor table  using actor_id 5.

###### -f constrant_file
instead of passing constraint from commandline they can also be exported from json file. the format of the json will be like
```
var data = {
    constraint: [{
        table_name: "actor",
        column_name: "actor_id",
        referenced_table_name: "actor_info",
        referenced_column_name: "actor_id"
    }, {
        table_name: "film_actor",
        column_name: "film_id",
        referenced_table_name: "film",
        referenced_column_name: "film_id"
    } ]
};
module.exports = data;
```
Here list of constraints are kept as 'constraints' object inside main object. So from commandline point of view each constraint is of the form 
```referenced_table_name.referenced_column_name=table_name.table_column```

##### -o output_file
This is the path of the file where all the dump statements are to be written. 
