var fs = require('fs');
var express = require('express');

var app = express.createServer(express.logger());

var content = fs.readFileSync('index.html');
var index_val = content.toString();

app.get('/', function(request, response) {
  response.send(index_val);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
