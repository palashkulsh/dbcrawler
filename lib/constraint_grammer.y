									
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

expressions: EOF { return [];}

    | JOIN_CONDITIONS EOF
{
return $1; }
    ;

TABLE_COLUMN: ALPHANUM DOT ALPHANUM 
{var temp = {}; temp.tableName =$1; temp.columnName =$3; $$=temp;}
            ;
JOIN_CONDITION: TABLE_COLUMN EQUALS TABLE_COLUMN  
{var temp={};
		   temp.referenced_table_name=$1.tableName;temp.table_name=$3.tableName;temp.referenced_column_name=$1.columnName;temp.column_name=$3.columnName;$$=temp;}
              ;

COMPLETE_JOIN_CONDITION: JOIN_CONDITION {$$=$1}
                       | COMPLETE_JOIN_CONDITION COMMA {$$=$1;}
;
JOIN_CONDITIONS: JOIN_CONDITIONS COMPLETE_JOIN_CONDITION 
               {$1.push($2);$$=$1; }
               | COMPLETE_JOIN_CONDITION
               {$$=[];$$.push($1); }
              ;
ALPHANUM: STRING_LIT {$$= yytext;}
        ;
