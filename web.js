var express = require('express');
var fs = require('fs');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
    var cont = fs.readFileSync('index.html', encoding='ascii');
    console.log(cont);
    //var cont = 'Hello World 2!';

    response.send(cont);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
