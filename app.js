let express = require('express');
let app = express();
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});
app.get('/s', function (req, res) {
    res.sendFile('s.html');
});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});


// let http = require('http');
//
// let nStatic = require('node-static');
//
// let fileServer = new nStatic.Server('./public');
//
// http.createServer(function (req, res) {
//
//     fileServer.serve(req, res);
//
// }).listen(5000);
