									
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
"." return "DOT"
"=" return "EQUALS"
[a-zA-Z0-9_]+ return "STRING_LIT"
"," return "COMMA"
";" return "SEMICOLON"
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */


%start expressions

%% /* language grammar */

expressions
    : SEED_VALUES EOF
{return $1; }
    ;

TABLE_COLUMN: ALPHANUM DOT ALPHANUM 
{var temp = {}; temp.tableName =$1; temp.columnName =$3; $$=temp;}
            ;
ALPHANUM: STRING_LIT {$$= yytext;}
        ;


VALUES: ALPHANUM {$$=[];$$.push($1);}
|  VALUES COMMA ALPHANUM {$1.push($3);$$=$1;}
;

SEED_VALUE: TABLE_COLUMN EQUALS VALUES {var temp={};temp.table=$1.tableName;temp.result={};temp.result.column=$1.columnName;temp.result.value=$3;$$=temp;}
;

COMPLETE_SEED_VALUE : COMPLETE_SEED_VALUE SEMICOLON {$$=$1;}
                    | SEED_VALUE {$$=$1;}
;

SEED_VALUES : SEED_VALUES COMPLETE_SEED_VALUE {$1.push($2);$$=$1;}
           | COMPLETE_SEED_VALUE {$$=[$1];}
;
