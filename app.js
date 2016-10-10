"use strict";

var express = require('express');
var app = express();

var PORT = 3002;

app.route('/user/:user_id')
.get(function (req, res) {
	//console.log(req.params);
	// get id
	// get info from database
	// send info to client
	res.send('Hello World!');
});

app.listen(PORT, function () {
	console.log('ListOfThings-API listening on port ' + PORT + '!');
});