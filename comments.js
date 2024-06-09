// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var ROOT_DIR = "html/";
var MongoClient = require('mongodb').MongoClient;
var db;
var dbUrl = 'mongodb://localhost:27017/commments';

MongoClient.connect(dbUrl, function(err, database) {
  if(err) throw err;
  db = database;
  console.log("Connected to the database");
});

http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  var query = urlObj.query;
  console.log("URL path " + urlObj.pathname);
  console.log("URL search " + urlObj.search);
  console.log("URL query " + query);
  if(urlObj.pathname.indexOf("comment") != -1) {
    console.log("comment route");
    if(req.method === "POST") {
      console.log("POST comment route");
      var jsonData = "";
      req.on('data', function(chunk) {
        jsonData += chunk;
      });
      req.on('end', function() {
        var reqObj = JSON.parse(jsonData);
        console.log(reqObj);
        db.collection("comments").insert(reqObj, function(err, records) {
          console.log("Record added as " + records[0]._id);
          res.writeHead(200);
          res.end("");
        });
      });
    } else if(req.method === "GET") {
      console.log("GET comment route");
      db.collection("comments", function(err, comments) {
        comments.find(function(err, items) {
          items.toArray(function(err, itemArr) {
            console.log("Document Array: ");
            console.log(itemArr);
            res.writeHead(200);
            res.end(JSON.stringify(itemArr));
          });
        });
      });
    }
  } else {
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}).listen(3000);

console.log('Server running at http://