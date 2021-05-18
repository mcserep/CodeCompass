%baseclass-preinclude <iostream>
// csirip

%token IDENTIFIER SEMICOLON COMMA WHICH SOURCEFILE TEAM DEV COMMIT

%%

start:
	WHICH returnList SEMICOLON { std::cout << ("Processing symbols.") << std::endl; }
;

returnList:
	fileUnit
|
	devUnit
|
	teamUnit
|
	commitUnit
;

fileUnit:
	SOURCEFILE
|
	SOURCEFILE COMMA returnList
;

devUnit:
	DEV
|
	DEV COMMA returnList
;

teamUnit:
	TEAM
|
	TEAM COMMA returnList
;

commitUnit:
	COMMIT
|
	COMMIT COMMA returnList
;
