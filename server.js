// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const config = require('./config.json');

const csv = require('csvtojson');

const app = express();
var _array = [];
var rooms = [];
var allsegments = [];

var summertime = config.isSummertime?2:1;
console.log(summertime);

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/getConfig', (req, res) => {
  res.json(config);
})

//define task route
app.get('/tasks', function(req, res) {

  function clearAll() {
    _array = [];
    rooms = [];
    allsegments = []
    console.log('Data removed');
  }

  var date = new Date();
  var time = date.getHours() + ':'+ date.getMinutes() + ':' + date.getSeconds();

  function parseSegments(item, index) {

    var segments = {
      "start": new Date((new Date().getUTCMonth() + 1) + ', ' + new Date().getDate() + ', ' + new Date().getFullYear() + ' ' + (parseInt(item['Von'].substring(0, 2))+summertime) + ':' + (parseInt(item['Von'].substring(3, 5))+summertime)),
      "end": new Date((new Date().getUTCMonth() + 1) + ', ' + new Date().getDate() + ', ' + new Date().getFullYear() + ' ' + (parseInt(item['Bis'].substring(0, 2))+summertime) + ':' + (parseInt(item['Bis'].substring(3, 5))+summertime)),
      "task": item['Raum']
    };
    return segments;
  };

  //map function
  function parseRooms(item, index) {
    if (index % 2 == 0) {
      color = config.theme.firBarColor /*"#0E2F44"*/ ;
    } else {
      color = config.theme.secBarColor /*"#8697A1"*/ ;
    }

    var lseg = [];

    for (var i = 0; i < allsegments[0].length; i++) {

      if (allsegments[0][i]['task'] == item) {
        lseg.push(allsegments[0][i])
      }
    }
    // variable to map
    var tasks = {
      "category": item,
      "color": color,
      "segments": lseg
    };
    return tasks;
  };

  //parse csv to JSON
  csv({
      delimiter: "auto",
      ignoreEmpty: true,
    })

    .fromFile(config.filePath)
    .on('json', (jsonObj) => {
      //push parsed lines to jsonObj
      _array.push(jsonObj)
    })
    .on('done', (err) => {
      //send data if parsing compvare
      if (err) {
        res.send('('+time+') sry, unable to parse csv')
      };
      console.log('('+time+') Sucessfully send JSON data')
      //map the data
      allsegments.push(_array.map(parseSegments))

      for (var i = 0; i < _array.length; i++) {
        if (rooms.length == 0 || rooms.indexOf(_array[i]['Raum']) == -1) {
          rooms.push(_array[i]['Raum'])
        }
      }
      rooms.sort((a, b) => {
        if (a.indexOf('MUWO R8') != -1 && b.indexOf('MUWO R8') != -1) {
          var sa = a.substring(6, 8);
          var sb = b.substring(6, 8);

          if (sa > sb) {
            return 1
          } else if (sa < sb) {
            return -1
          } else {
            return 0
          }

        } else if (a.indexOf('MUWO R') != -1 && b.indexOf('MUWO R') != -1) {
          var sa = parseInt(a.substring(6, 8));
          var sb = parseInt(b.substring(6, 8));

          if (sa > sb) {
            return 1
          } else if (sa < sb) {
            return -1
          } else {
            return 0
          }

        }
      });
      res.json(rooms.map(parseRooms));
      clearAll()
    });
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`back-end running on localhost:${port}`));
