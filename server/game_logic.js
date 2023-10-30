module.exports = {
    env: {
        // The global state of the game
        players: [], // An array to store the players
        moves: [], // An array to store the moves of the players
        gameMatrix: [ // The game matrix
            [2, 0], // The values when both players cooperate or player 1 cooperates and player 2 defects
            [3, 1]  // The values when player 1 defects and player 2 cooperates or both players defect
        ],
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
