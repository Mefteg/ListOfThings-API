"use strict";

var MongoClient = require('mongodb').MongoClient;
var express = require('express');

var PORT = 3002;

var API_VERSION = '0.0.1';

// ### DATABASE ###
MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
  if (err) {
    throw err;
  }
  db.collection('users').find().toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log(result);
  });
});


// ### SERVER ###

var app = express();

app.route('/user/:user_id')
.get(function (req, res) {
	var data = {
		version: API_VERSION,
	};

	// get id
	var userId = req.params.user_id;
	if (!userId)
	{
		res.send(JSON.stringify(data));
	}

	data.id = userId;

	// get info from database
	data.lists = [1, 2, 5];

	// send info to client
	res.send(JSON.stringify(data));
});

app.listen(PORT, function () {
	console.log('ListOfThings-API listening on port ' + PORT + '!');
});