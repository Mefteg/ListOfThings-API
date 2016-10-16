"use strict";

var MongoClient = require('mongodb').MongoClient;
var MongoObjectID = require('mongodb').ObjectID;
var express = require('express');

var PORT = 3002;

var API_VERSION = '0.0.1';

var DATABASE;

var APP;

// ### STATIC ###

function CreateServer()
{
	APP = express();

	APP.route('/user/:user_id')
	.get(function (req, res) {
		// get id
		var userId = req.params.user_id;
		if (userId == null)
		{
			SendError({content: "No user id."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			SendError(err, req, res);
		}
		else
		{
		  	var query = {id: userId};
		  	DATABASE.collection('users').find(query).toArray(function(err, result) {
		    	if (err == null && result.length == 1)
		    	{
		    		res.send(JSON.stringify(result[0]));
			    }
			    else
			    {
			    	SendError(err, req, res);
			    }
	  		});
		}
	});

	APP.route('/list/:list_id')
	.get(function (req, res) {
		// get id
		var listId = req.params.list_id;
		if (listId == null)
		{
			SendError({content: "No list id."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			SendError(err, req, res);
		}
		else
		{
		  	var query = {"_id": new MongoObjectID(listId)};
		  	console.log(query);
		  	DATABASE.collection('lists').find(query).toArray(function(err, result) {
		    	if (err == null && result.length == 1)
		    	{
		    		res.send(JSON.stringify(result[0]));
			    }
			    else
			    {
			    	SendError(err, req, res);
			    }
	  		});
		}
	});
}

function ConnectDatabase()
{
	MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err)
		{
	    	console.log(err);
	    	return;
	  	}

	  	DATABASE = db;

	  	RunServer();
	});
}

function RunServer()
{
	APP.listen(PORT, function () {
		console.log('ListOfThings-API listening on port ' + PORT + '!');
	});
}

function SendError(_error, _req, _res)
{
	_res.send(JSON.stringify({error: _error}));
}

// ### SERVER ###

CreateServer();

// ### DATABASE ###

ConnectDatabase();







