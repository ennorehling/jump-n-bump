@ECHO OFF
ECHO Note: Script requires NPM on the PATH
ECHO If successful, run 'build.bat' to build
call npm install
node_modules\.bin\bower install


PAUSE