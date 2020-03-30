
var express = require('express');
var app = express();

// set up json parsing
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

// Handle challenge behavior
app.post("/", jsonParser, function (req, res, next) {
    // forward to next post if not a challenge request 
  if(!req.body.challenge){
    console.log(req.body);
    next();
  }

  console.log("challenge request posted")
  console.log(req.body);

  res.status(200);
  res.type('text/plain');
  res.json({ 'challenge': req.body.challenge  });
} );

module.exports = {
    app
}

