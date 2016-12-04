"use strict";

var MongoObjectID = require('mongodb').ObjectID;

var utils = require('../utils');

class List
{
  constructor(_database)
  {
    this.db = _database;
  };

  create(_req, _res)
  {
    // get user id
		var userId = _req.body.user_id;
		if (userId == null)
		{
			utils.SendError({content: "No user id."}, _req, _res);
			return;
		}

		// get name
		var listName = _req.body.name;
		if (listName == null)
		{
			utils.SendError({content: "No list name."}, _req, _res);
			return;
		}

    var instance = this;
    utils.VerifyToken(token, function(_error, _data) {
    	if (_error)
    	{
    		utils.SendError(_error, _req, _res);
    	}
    	else
    	{
    		CreateListFromDatabase(instance.db, listName, userId, function(_error, _data) {
    			if (_error)
    			{
    				utils.SendError(_error, _req, _res);
    			}
    			else
    			{
    				_res.send(JSON.stringify(_data));
    			}
    		});
    	}
    });
  }

  get(_req, _res)
  {
    // get id
		var listId = _req.params.list_id;
		if (listId == null)
		{
			utils.SendError({content: "No list id."}, req, _res);
			return;
		}

    // get token
  	var token = _req.body.token;
  	if (token == null)
  	{
  		utils.SendError({content: "No token."}, _req, _res);
  		return;
  	}

    var instance = this;
    utils.VerifyToken(token, function(_error, _data) {
    	if (_error)
    	{
    		utils.SendError(_error, _req, _res);
    	}
    	else
    	{
    		GetListFromDatabase(instance.db, listId, function(_error, _data) {
    			if (_error)
    			{
    				utils.SendError(_error, _req, _res);
    			}
    			else
    			{
    				_res.send(JSON.stringify(_data));
    			}
    		});
    	}
    });
  };

  update(_req, _res)
  {
    // get id
		var listId = _req.params.list_id;
		if (listId == null)
		{
			utils.SendError({content: "No list id."}, req, _res);
			return;
		}

		// get name
		var listName = _req.body.name;

		// get new item
		var listItem = null;
		if (_req.body.item != null)
		{
			listItem = JSON.parse(_req.body.item);
		}

		// we need at least one data
		if (listName == null && listItem == null)
		{
			utils.SendError({content: "No name or item."}, _req, _res);
			return;
		}

    utils.VerifyToken(token, function(_error, _data) {
      if (_error)
      {
        utils.SendError(_error, _req, _res);
      }
      else
      {
        GetListFromDatabase(instance.db, listId, listName, listItem, function(_error, _data) {
          if (_error)
          {
            utils.SendError(_error, _req, _res);
          }
          else
          {
            _res.send(JSON.stringify(_data));
          }
        });
      }
    });
  }
}

function CreateListFromDatabase(_database, _listName, _userId, _callback)
{
  var query = {"name": _listName};
  // insert new list
  _database.collection('lists').insertOne(query, function(err, data) {
    if (err == null && data.result != null)
    {
      var listId = data.insertedId;
      var filter = {"id": _userId};
      var update = {"$push": {"lists": listId}};
      // update user's info
      _database.collection('users').updateOne(filter, update, function(err, data) {
        if (err == null)
        {
          _callback({"ok": data.result.ok, "data": data});
        }
        else
        {
          _callback(err, null);
        }
      });
    }
    else
    {
      _callback(err, null);
    }
  });
}

function GetListFromDatabase(_database, _id, _callback)
{
  var query = {"_id": new MongoObjectID(_id)};
  _database.collection('lists').find(query).toArray(function(err, result) {
    if (err == null && result.length == 1)
    {
      _callback(null, result[0]);
    }
    else
    {
      _callback(err, null);
    }
  });
}

function UpdateListFromDatabase(_database, _id, _name, _item, _callback)
{
  var filter = {"_id": new MongoObjectID(_id)};
  var update = {};
  if (listName != null)
  {
    update = {"$set": {"name": _name}};
  }
  else
  {
    update = {"$push": {"items": _item}};
  }

  _database.collection('lists').update(filter, update, function(err, data) {
    if (err == null)
    {
      _callback(null, {"ok": data.result.ok, "data": data});
    }
    else
    {
      _callback(err, null);
    }
  });
}

module.exports = List;
