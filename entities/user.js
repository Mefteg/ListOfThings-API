"use strict";

var utils = require('../utils');

class User
{
  constructor(_database)
  {
    this.db = _database;
  };

  get(_req, _res)
  {
    // get id
  	var userId = _req.params.user_id;
  	if (userId == null)
  	{
  		utils.SendError({content: "No user id."}, _req, _res);
  		return;
  	}

  	// get token
  	var token = _req.body.token;
  	if (token == null)
  	{
  		utils.SendError({content: "No token."}, _req, _res);
  		return;
  	}
  	else
  	{
  		utils.VerifyToken(token, function(_error, _data) {
  			if (_error)
  			{
  				utils.SendError(_error, _req, _res);
  			}
  			else
  			{
  				GetUserFromDatabase(DATABASE, userId, function(_error, _data) {
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
}


// _callback: function(error, data)
function GetUserFromDatabase(_database, _id, _callback)
{
	var query = {id: _id};
	_database.collection('users').find(query).toArray(function(err, result) {
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

module.exports = User;
