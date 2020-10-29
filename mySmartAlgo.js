var config = require("./config");
var _ = require("lodash");
var gen = require('random-seed');
var rand = gen.create();

function nextGuess(gameId, roundId, secretLength, participants, myGuessTracker) {
    var myGuess = {
        guesses: []
    };
    if (!secretLength) {
        secretLength = 1
    }

    _.remove(participants, function(item) {
        return item.teamId.toUpperCase() === config.team.toUpperCase() || !item.isAlive;
    });

    if (participants.length == 0)
        return myGuess;

    for (i = 0; i < 5; i++) {
        var participant = participants[Math.floor(Math.random() * participants.length)]; //Choose a random participant

        var secretRange = Math.pow(10, secretLength - 1);
        var secret = rand.intBetween(secretRange, secretRange * 10 - 1);

        myGuess.guesses.push({
            team: participant.teamId,
            guess: `${secret}`
        });
    }
    return myGuess;

}

module.exports = {
    nextGuess: nextGuess
}