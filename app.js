"use strict";

var MongoClient = require('mongodb').MongoClient;
var MongoObjectID = require('mongodb').ObjectID;
var express = require('express');
var bodyParser = require('body-parser');

var utils = require('./utils');

var User = require('./entities/user');

var PORT = 3002;

var API_VERSION = '0.0.1';

var DATABASE;

var APP;

var USER;

// ### STATIC ###

function CreateServer()
{
	APP = express();

	// for POST and PUT requests (parse request.body)
	APP.use(bodyParser.json()); // for parsing application/json
	APP.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


	// ## USER ##
	USER = new User(DATABASE);
	APP.route('/user/:user_id').
	post(function(req, res) {
		USER.get(req, res);
	});

	// ## LIST ##
	APP.route('/list/:list_id')
	.post(function (req, res) { // get list
		// get id
		var listId = req.params.list_id;
		if (listId == null)
		{
			utils.SendError({content: "No list id."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			utils.SendError(err, req, res);
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
			    	utils.SendError(err, req, res);
			    }
	  		});
		}
	})
	.put(function (req, res) { // update list
		// get id
		var listId = req.params.list_id;
		if (listId == null)
		{
			utils.SendError({content: "No list id."}, req, res);
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
			utils.SendError({content: "No name or item."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			utils.SendError(err, req, res);
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
			    	utils.SendError(err, req, res);
			    }
	  		});
		}
	});

	APP.route('/list')
	.post(function (req, res) { // create a new list for the user
		// get user id
		var userId = req.body.user_id;
		if (userId == null)
		{
			utils.SendError({content: "No user id."}, req, res);
			return;
		}

		// get name
		var listName = req.body.name;
		if (listName == null)
		{
			utils.SendError({content: "No list name."}, req, res);
			return;
		}

		// get info from database
		if (DATABASE == null)
		{
			utils.SendError({content: "No databse connection."}, req, res);
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
			    			utils.SendError(err, req, res);
	  					}
		    		});
			    }
			    else
			    {
			    	utils.SendError(err, req, res);
			    }
	  		});
		}
	});
}

function RunServer()
{
	APP.listen(PORT, function () {
		console.log('ListOfThings-API listening on port ' + PORT + '!');
	});
}

function ConnectDatabase(_callback)
{
	MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err)
		{
			console.log(err);
		}

		DATABASE = db;

		_callback(err, null);
	});
}

// ### DATABASE ###

ConnectDatabase(function(err, data) {
	if (err)
	{
		console.log(_err);
	}
	else
	{
		CreateServer();
		RunServer();
	}
});
