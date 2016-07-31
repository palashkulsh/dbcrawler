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
    }, {
        table_name: "actor",
        column_name: "actor_id",
        referenced_table_name: "film_actor",
        referenced_column_name: "actor_id"
    }, ]
};
module.exports = data;