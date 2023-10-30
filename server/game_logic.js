module.exports = {
    env: {
        // The global state of the game
        players: [], // An array to store the players
        moves: [], // An array to store the moves of the players
        gameMatrix: { // The game matrix
            'cooperate': {
                'cooperate': [2, 2], 
                'defect': [0, 3] 
            },
            'defect': {
                'cooperate': [3, 0], 
                'defect': [1, 1] 
            }
        },
        numberOfRounds: 0, // The number of rounds in the game
    },

    // A function to add a player to the game
    addPlayer: function(player) {
        this.env.players.push(player);
    },

    // A function to record a move
    recordMove: function(player, move) {
        this.env.moves.push({player: player, move: move});
    },

    // A function to get the last move of a player
    getLastMove: function(player) {
        for (let i = this.env.moves.length - 1; i >= 0; i--) {
            if (this.env.moves[i].player === player) {
                return this.env.moves[i].move;
            }
        }
        return null;
    },

    // A function to reset the game
    reset: function() {
        this.env.players = [];
        this.env.moves = [];
    }
};
