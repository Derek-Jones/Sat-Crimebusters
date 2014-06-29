'use strict';

var fs = require('fs'),
    transmissionsData, vesselData,
    express = require('express'),
    app = express();

app.set('title', 'Sat-Crimebusters');
app.use('/', express.static(__dirname + '/../'));

app.get('/vessels', function(req, res) {
  res.send(vesselData);
});

app.get('/transmissions', function(req, res) {
  res.send(transmissionsData);
});

fs.readFile('resources/truncated.csv', function(err, contents) {
  if (err) {
    console.error(err);
    process.exit();
  } else {
    console.log('Completed reading truncated');
    transmissionsData = contents;
    fs.readFile('resources/static_lookup.csv', function(err, contents) {
      if (err) {
        console.log(error);
        process.exit();
      } else {
        console.log('Completed reading static_lookup');
        vesselData = contents;
        console.log('Listening on port http://localhost:3000');
        app.listen(3000);
      }
    });
  }
});

