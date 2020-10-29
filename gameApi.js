var request = require("request");
var moment = require("moment");
var config = require("./config");

var auth = "Basic " + Buffer.from(config.team + ":" + config.password, "").toString("base64");

var apiHeaders = {
    'Authorization': auth
}

var apiJoin = config.baseApi + '/api/join';
var apiStatus = config.baseApi + '/api/gamestatus';
var apiGuess = config.baseApi + '/api/guess';

function joinGame(callback) {

    request.post({
        url: apiJoin,
        json: true,
        rejectUnauthorized: false,
        headers: apiHeaders
    }, function(error, response, body) {


        if (response && response.statusCode >= 200 && response.statusCode < 300) {

            callback(null, body);

        } else {

            callback({
                errorResponse: (response) ? response.body : 'No response'
            }, null);

        }

    });

}

function getGameStatus(callback) {

    request.get({
        url: apiStatus,
        json: true,
        rejectUnauthorized: false,
        headers: apiHeaders
    }, function(error, response, body) {

        if (response && response.statusCode >= 200 && response.statusCode < 300) {
            callback(null, body.data);
        } else {

            callback({
                errorResponse: (response) ? response.body : 'No response'
            }, null);
        }

    });

}

function guess(req, callback) {

    request.post({
        url: apiGuess,
        json: true,
        rejectUnauthorized: false,
        headers: apiHeaders,
        body: req
    }, function(error, response, body) {
        if (response && response.statusCode >= 200 && response.statusCode < 300) {

            callback(null, body);

        } else {

            callback({
                errorResponse: (response) ? response.body : 'No response'
            }, null);

        }

    });
}

module.exports = {
    join: joinGame,
    status: getGameStatus,
    guess: guess
}