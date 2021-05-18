#include <stdio.h>

#include <FlexLexer.h>
#include "Parser.h"

yyFlexLexer *fl;

int Parser::lex()
{
  return fl->yylex();
}

int main(int argc, char** argv)
{
  return 0;
}