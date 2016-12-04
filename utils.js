"use strict";

var https = require('https');

var utils = {};

utils.SendError = function(_error, _req, _res)
{
	_res.send(JSON.stringify({error: _error}));
};

// _callback: function(error, data)
utils.VerifyToken = function(_token, _callback)
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
};

module.exports = utils;
