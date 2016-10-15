"use strict";

var MongoClient = require('mongodb').MongoClient;
var express = require('express');

var PORT = 3002;

var API_VERSION = '0.0.1';

// ### STATIC ###

function SendError(_error, _req, _res)
{
	_res.send(JSON.stringify({error: _error}));
}

// ### DATABASE ###
// Should I keep a single connection?!


// ### SERVER ###

var app = express();

app.route('/user/:user_id')
.get(function (req, res) {
	var data = {
		version: API_VERSION,
	};

	// get id
	var userId = req.params.user_id;
	if (userId == null)
	{
		SendError({content: "No user id."}, req, res);
		return;
	}

	data.id = userId;

	// get info from database
	MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err)
		{
	    	SendError(err, req, res);
	    	return;
	  	}

	  	var query = {id: userId};
	  	db.collection('users').find(query).toArray(function(err, result) {
	    	if (err == null && result.length == 1)
	    	{
	    		res.send(JSON.stringify(result[0]));
		    }
		    else
		    {
		    	SendError(err, req, res);
		    }
  		});
	});
});

app.listen(PORT, function () {
	console.log('ListOfThings-API listening on port ' + PORT + '!');
});