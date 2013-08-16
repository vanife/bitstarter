var express = require('express');
var fs = require('fs');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
    var buf = fs.readFileSync('index.html');
    var cont = buf.toString('utf8');
    //var cont = 'Hello World 2!';

    response.send(cont);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
