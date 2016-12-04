"use strict";

var MongoClient = require('mongodb').MongoClient;
var MongoObjectID = require('mongodb').ObjectID;
var express = require('express');
var bodyParser = require('body-parser');

var utils = require('./utils');

var User = require('./entities/user');
var List = require('./entities/list');

var PORT = 3002;

var API_VERSION = '0.0.1';

var DATABASE;

var APP;

// Entities
var USER;
var LIST;

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
	LIST = new List(DATABASE);
	APP.route('/list')
	.post(function (req, res) { // create a new list for the user
		LIST.create(req, res);
	});
	APP.route('/list/:list_id')
	.post(function (req, res) { // get list
		LIST.get(req, res);
	})
	.put(function (req, res) { // update list
		LIST.update(req, res);
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
