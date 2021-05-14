%baseclass-preinclude <iostream>

%token IDENTIFIER SEMICOLON COMMA WHICH FILE TEAM DEV COMMIT

%%

start:
	WHICH returnList SEMICOLON { std::cout << "Processing symbols." << std::endl; }
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
	FILE
|
	FILE COMMA returnList
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