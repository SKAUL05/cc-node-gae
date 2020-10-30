var config = require("./config");
var moment = require("moment");
var _ = require("lodash");
var gameApi = require('./gameApi.js');
var colors = require('colors');
colors.setTheme({
    info: 'blue',
    warn: 'yellow',
    error: 'red',
    success: 'green'
});
var algo = require("./mySmartAlgo");

var myGuessTracker = {};

if (!config.team || config.team.trim() === "") {
    console.log(`Please put your team name and password into config.js and start again.`.error);
    return;
}

console.log(`I am playing as "${config.team}"`.success);
console.log("");

function gameStatusReceived(err, data) {
    if((err) || (!data)){
        console.log('Get game status failed'.error);
        console.log(err);
        fetchGameStatus();
    } else {
        console.log('');
        console.log(`GameId:${data.gameId} RoundId:${data.roundId} State:${data.status}`.info);
        console.log('--------------------------------------------------------------------'.info);

        var key = `${data.gameId}-${data.roundId}`;
        var haveIJoined = _.find(data.participants, function(o) {
            return o.teamId.toUpperCase() === config.team.toUpperCase();
        }) != null;
        switch (data.status) {
            case 'Joining':
                //joining phase
                myGuessTracker = {};

                if (!haveIJoined) {
                    gameApi.join(function(errJoin, dataJoin) {
                        if (errJoin) {
                            console.log('Join failed'.error);
                            console.log(errJoin);
                        } else {
                            console.log('Join Successfully'.success);
                            console.log(`${dataJoin.data.gameId}`.success);
                        }

                        fetchGameStatus();
                    });
                } else {
                    console.log(`Already joined, waiting to play`.info);
                    fetchGameStatus();
                }
                break;
            case 'Running':
                if (!haveIJoined) {
                    //I have missed the opportunity to join current round, let me wait till the next round starts
                    console.log(`Oho, I have missed the joining phase, let me wait till the next round starts`.info);
                    fetchGameStatus();
                } else {
                    var amIAlive = _.find(data.participants, function(o) {
                        return o.teamId.toUpperCase() === config.team.toUpperCase() && o.isAlive === true;
                    }) != null;
                    if (!amIAlive) {
                        //My Team has died in this round.
                        console.log(`I am dead, waiting to respawn in next round...:(`.info);
                        fetchGameStatus();
                    } else {
                        var myNextGuess = algo.nextGuess(data.gameId, data.roundId, data.secretLength, data.participants, myGuessTracker);
                        if (myNextGuess.guesses && myNextGuess.guesses.length > 0) {

                            console.log(`My guess : ${JSON.stringify(myNextGuess)}`.warn);
                            gameApi.guess(myNextGuess, function(errGuess, dataGuess) {

                                if (errGuess) {
                                    console.log('My guess failed'.error);
                                    console.log(errGuess);
                                } else {

                                    var totalScoreInThisGuess = 0;
                                    if (dataGuess.data.guesses) {
                                        dataGuess.data.guesses.forEach(function(item, i) {
                                            totalScoreInThisGuess += item.score ? item.score : 0;
                                        });
                                    }

                                    console.log(`Guess successful : Score ${totalScoreInThisGuess}`.success);
                                    console.log(`Result : ${JSON.stringify(dataGuess)}`.info);

                                    //Store result to feed into my smart algo, would help to determine my next guess
                                    var guessKey = `Round-${dataGuess.roundId}`;
                                    if (!myGuessTracker[guessKey]) myGuessTracker[guessKey] = [];

                                    myGuessTracker[guessKey].push(dataGuess);
                                }

                                fetchGameStatus();

                            });
                        } else {
                            console.log(`No participant to play with`.info);
                            fetchGameStatus();
                        }
                    }
                }
                break;
            default:
                fetchGameStatus();
                break;
        }

    }
}

function fetchGameStatus() {
    setTimeout(function() {
        gameApi.status(gameStatusReceived); //fetch game status after 5 seconds
    }, 5000);
}

gameApi.status(gameStatusReceived); //fetch game status