// myparser.js
var fs = require("fs");
var jison = require("jison");
var Path = require('path');

var Parser = {
    getConstraintParser: function () {
        var bnf = fs.readFileSync(Path.resolve('lib/constraint_grammer.y'), "utf8");
        var parser = new jison.Parser(bnf);
        return parser;
    },

    getSeedParser: function () {
        var bnf = fs.readFileSync(Path.resolve('lib/seed_grammer.y'), "utf8");
        var parser = new jison.Parser(bnf);
        return parser;
    },

};

module.exports = Parser;

(function () {
    if (require.main == module) {
        var sparser = Parser.getSeedParser();
        var cparser = Parser.getConstraintParser();
        console.log(sparser.parse('sales_data.order_id=123,456;sales_order_revenue.id=123242,325235;'))
        console.log(cparser.parse('sales_data.order_id=sales_order_revenue.id,'))
    }
})();