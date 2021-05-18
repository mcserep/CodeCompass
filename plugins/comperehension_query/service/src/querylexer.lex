%option noyywrap c++ yylineno

%{
#include <iostream>
#include "Parser.h"

using namespace std;
%}

LETTER          [a-zA-Z]
NUMBER          [0-9]
WHITESPACE      [ \t\n]

%%
"which"						{ printf("which"); return Parser::WHICH; }
"file"						{ return Parser::SOURCEFILE; }
"commit"					{ return Parser::COMMIT; }
"dev"						{ return Parser::DEV; }
"team"						{ return Parser::TEAM; }
("_"|{LETTER})("_"|{LETTER}|{NUMBER})*          { printf("identifier "); return Parser::IDENTIFIER; }
","						{ return Parser::COMMA; }
";"                                             { printf("semicolon "); return Parser::SEMICOLON; }


{WHITESPACE}+                                   // Skip.

%%