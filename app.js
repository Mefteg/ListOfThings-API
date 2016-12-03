"use strict";

var MongoClient = require('mongodb').MongoClient;
var MongoObjectID = require('mongodb').ObjectID;
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');

var PORT = 3002;

var API_VERSION = '0.0.1';

var DATABASE;

var APP;

// ### STATIC ###

// _callback: function(error, data)
function VerifyToken(_token, _callback)
{
	var address = "https://www.googleapis.com/oauth2/v3/tokeninfo";
	address += "?id_token=" + _token;

	https.get(address, (res) => {

	  console.log('statusCode:', res.statusCode);
		console.log('headers:', res.headers);

		var rawData = "";
		res.on('data', (chunk) => {
			rawData += chunk;
		});
	  res.on('end', () => {
			var data = JSON.parse(rawData);
			console.log(data);
			if (res.statusCode != 200)
			{
				_callback("Invalid Status Code (" + res.statusCode + "). Expected (200).", null);
			}
			else if (data.aud != process.env.GOOGLE_CLIENT_ID)
			{
				_callback("Google Client ID isn't correct.", null);
			}
			else
			{
				_callback(null, null);
			}
	  });

	}).on('error', (e) => {
	  _callback(e, null);
	});
}

// _callback: function(error, data)
function GetUser(_id, _callback)
{
	var query = {id: _id};
	DATABASE.collection('users').find(query).toArray(function(err, result) {
		if (err == null && result.length == 1)
		{
			_callback(null, result[0]);
		}
		else
		{
			_callback(null, null);
		}
	});
}

function CreateServer()
{
	APP = express();

	// for POST and PUT requests (parse request.body)
	APP.use(bodyParser.json()); // for parsing application/json
	APP.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


	// ## USER ##
	APP.route('/user/:user_id')
	.get(function (req, res) {
		// check database
		if (DATABASE == null)
		{
			SendError(err, req, res);
		}

		// get id
		var userId = req.params.user_id;
		if (userId == null)
		{
			SendError({content: "No user id."}, req, res);
			return;
		}

		// get token
		var token = req.query.token;
		if (token == null)
		{
			SendError({content: "No token."}, req, res);
			return;
		}
		else
		{
			VerifyToken(token, function(_error, _data) {
				if (_error)
				{
					SendError(_error, req, res);
				}
				else
				{
					GetUser(userId, function(_error, _data) {
						if (_error)
						{
							SendError(_error, req, res);
						}
						else
						{
							res.send(JSON.stringify(_data));
						}
					});
				}
			});
		}
	});

	// ## LIST ##
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
	})
	.put(function (req, res) {
		// get id
		var listId = req.params.list_id;
		if (listId == null)
		{
			SendError({content: "No list id."}, req, res);
			return;
		}

		// get name
		var listName = req.body.name;

		// get new item
		var listItem = null;
		if (req.body.item != null)
		{
			listItem = JSON.parse(req.body.item);
		}

		// we need at least one data
		if (listName == null && listItem == null)
		{
			SendError({content: "No name or item."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			SendError(err, req, res);
		}
		else
		{
		  	var filter = {"_id": new MongoObjectID(listId)};
		  	var update = {};
		  	if (listName != null)
		  	{
		  		update = {"$set": {"name": listName}};
		  	}
		  	else
		  	{
		  		update = {"$push": {"items": listItem}};
		  	}
		  	DATABASE.collection('lists').update(filter, update, function(err, data) {
		    	if (err == null)
		    	{
		    		res.send(JSON.stringify({"ok": data.result.ok, "data": data}));
			    }
			    else
			    {
			    	SendError(err, req, res);
			    }
	  		});
		}
	});

	APP.route('/list')
	.post(function (req, res) {
		// get user id
		var userId = req.body.user_id;
		if (userId == null)
		{
			SendError({content: "No user id."}, req, res);
			return;
		}

		// get name
		var listName = req.body.name;
		if (listName == null)
		{
			SendError({content: "No list name."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			SendError({content: "No databse connection."}, req, res);
		}
		else
		{
		  	var query = {"name": listName};
		  	// insert new list
		  	DATABASE.collection('lists').insertOne(query, function(err, data) {
		    	if (err == null && data.result != null)
		    	{
		    		var listId = data.insertedId;
		    		console.log(data);
		    		var filter = {"id": userId};
		    		var update = {"$push": {"lists": listId}};
		    		console.log(filter);
		    		console.log(update);
		    		// update user's info
	  				DATABASE.collection('users').updateOne(filter, update, function(err, data) {
	  					if (err == null)
	  					{
		    				res.send(JSON.stringify({"ok": data.result.ok, "data": data}));
	  					}
	  					else
	  					{
			    			SendError(err, req, res);
	  					}
		    		});
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
