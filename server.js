var express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose');

var app = express();
var port = process.env.PORT || 8080;

//Instantiating Morgan to log http requests to console (helpful for debugging)
app.use(morgan('dev'));

//Instantiating a server at port of the process environment (heroku) or at 8080 (default).
app.listen(port, function() {
  console.log("Server is listening on port: " + port);
});
