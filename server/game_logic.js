module.exports = {
    env: {
        // The global state of the game
        players: [], // An array to store the 2 players
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
        numberOfRounds: 5, // The number of rounds in the game
        payoff: [0, 0], // The payoff for each player
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

    // A function to add a player to the game
    addPlayer: function(player) {
        this.env.players.push(player);
    },

    // A function to record a move
    recordMove: function(player, move) {
        this.env.moves.push({player: player, move: move});
    },

    // A function to reset the game
    reset: function() {
        this.env.players = [];
        this.env.moves = [];
        this.env.payoff = [0, 0];
    },

    // A function to run the game
    runGame: function(code0, code1) {
        // Reset the game
        this.reset();

        // Run the game for a certain number of rounds
        for (let round = 0; round < this.env.numberOfRounds; round++) {
            let move; // move is used in the Blockly code
            // Player 0
            var opponent = 1;
            var lastOpponentMove = this.getLastMove(opponent); // lastOpponentMove is used in the Blockly code
            eval(code0); // Execute the Blockly code to compute move of Player 0
            let move0 = move;
            // Player 1
            var opponent = 0;
            var lastOpponentMove = this.getLastMove(opponent);
            eval(code1); // Execute the Blockly code to compute move of Player 1
            let move1 = move;

            // Record the moves
            this.recordMove(0, move0);
            this.recordMove(1, move1);

            // Update the payoff
            let payoff0 = this.env.gameMatrix[move0][move1][0];
            let payoff1 = this.env.gameMatrix[move0][move1][1];
            this.env.payoff[0] += payoff0;
            this.env.payoff[1] += payoff1;
        }

        // Return the result
        return {
            index: this.env.payoff[0] > this.env.payoff[1] ? 0 : 1,
            logs: this.env.moves
        };
    }
};
