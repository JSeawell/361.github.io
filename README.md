# cs361-project

The node app will currently run on port 12120, while the json-server will run on port 12121 if you use the provided commands.

These are the commands to start both the node app & the json-server running in the background on Flip:

```
exec bash
./node_modules/forever/bin/forever start app.js
./node_modules/.bin/npx json-server --port 12121 --watch db.json >> ./json-server.log 2>&1 </dev/null &
```

-----

Otherwise, the Node app can be run on your personal computer like any other node site from CS 290. The command to start the json-server, running in the foreground of your terminal is one of these two (either should work):

```
npx json-server --port 12121 --watch db.json
./node_modules/.bin/npx json-server --port 12121 --watch db.json
```
