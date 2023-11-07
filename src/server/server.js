const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'client')));
const gameLogic = require('./game_logic.js');
const N = gameLogic.N;
const runGame = gameLogic.runGame.bind(gameLogic);
const env = gameLogic.env;

app.use(express.json()); // for parsing application/json

// Generate a random secret for the session
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');

// Session allows you to set Server-sided "cookies"
// Req now has a session attribute
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));

let sessionToPlayer = {};
let nextPlayerId = 0; // Cycles between 0 and 1
let numberOfPlayers = 0; // 0 or 1 or 2
let gameIndex = undefined;
let gameLogs = undefined;
let gameDone = false;

// When player connects, attempt to register
app.post('/register', async (req, res, next) => {
    if (req.session.playerId === undefined) {
        if (numberOfPlayers < 2) {
            req.session.playerId = nextPlayerId; // Bind playerID to server-sided session "cookies"
            nextPlayerId = (nextPlayerId+1) % 2;
            numberOfPlayers++; // Increment the number of players
            sessionToPlayer[req.sessionID] = req.session.playerId;
            console.log(`Player ${req.session.playerId} has joined the game.`);

            // Send player ID, session ID and message back to user
            res.status(200).send({
                playerId: req.session.playerId,
                sessionId: req.sessionID,
                message: `Player ${req.session.playerId} has joined the game.\nSession ID: ${req.sessionID}\nPlayer ID: ${req.session.playerId}`
            })
        } else {
            res.status(503).send({
                message: 'The game is currently full. Please try again later.'
            });
        }
    } else {
        res.status(200).send({
            message: `Player ${req.session.playerId} is already registered.`
        });
    }
    const chalk = require('chalk');
    console.log('Session ID:', req.sessionID, '\n', chalk.blue('Player ID:'), req.session.playerId);
    next();
});


let playerCodes = {};

// Respond to request from one client
app.post('/execute', async (req, res) => {
    console.log("Received request to /execute endpoint");
    let { code } = req.body;
    let playerId = req.session.playerId;
    console.log(`Received code from player ${playerId}:\n`, code); // Log the received code

    playerCodes[playerId] = code;

    console.log("Player codes: ", playerCodes); // Log the player codes

    // Players ready, run game
    if (playerCodes[0] && playerCodes[1]) {
        console.log("Both players have submitted their code. Running the game..."); // Log before running the game
        console.log("Player 0 code: ", playerCodes[0]); // Log player 0 code
        console.log("Player 1 code: ", playerCodes[1]); // Log player 1 code
        console.log("Game state before running the game: ", JSON.stringify(gameLogic.env)); // Log game state
        try {
            let { index, logs } = runGame(playerCodes[0], playerCodes[1]);
            gameIndex = index
            gameLogs = logs
            gameDone = true

            // Send the result back to the client (only this client's response)
            console.log("Execution result: ", { output: gameIndex, logs: gameLogs, payoff: gameLogic.env.payoff });
            res.status(200).send({ output: gameIndex, logs: gameLogs, payoff: gameLogic.env.payoff });
        } catch (error) {
            console.error("Error executing code: ", error.message);
            res.status(500).send({ error: error.message });
        }
        console.log("Finished processing /execute request");

        // Reset playerCodes
        playerCodes = {};
    } else {
        console.log("Waiting for the other player to submit their code."); // Log when waiting for the other player
        // Wait 10 seconds for other player response
        for (let i = 0; i < 10; i++) {
            await new Promise((res) => { setTimeout(res, 1000); }); // Wait 1 second
            console.log(`Checking if game done (${i})`)
            if (gameDone) {
                console.log('Game done! Sending game result to client')
                res.status(200).send({
                    message: 'Got other player response.',
                    output: gameIndex,
                    logs: gameLogs,
                    payoff: gameLogic.env.payoff
                });
                gameDone = false
                return;
            }
        }
        console.log('Game done not detected, returning to client')
        res.status(200).send({ message: `Did not receive other player code yet. Standing by` });
    }
});

app.get('/leave', async (req, res) => {
    console.log("Received request to /leave endpoint");
    try {
        let playerId = req.session.playerId;
        if (playerId !== undefined) {
            delete playerCodes[playerId];
            nextPlayerId = playerId; // Free the player ID
            numberOfPlayers--; // Decrement the number of players
            delete sessionToPlayer[req.sessionID];
            req.session.destroy();
            console.log(`Player ${playerId} has left the game.`);
        }
        res.status(200).send({ message: 'Player has left the game' });
    } catch (error) {
        console.error("Error processing leave request: ", error.message);
        res.status(500).send({ error: error.message });
    }
    console.log("Finished processing /leave request");
});

let PORT = process.env.PORT || 3000;

const startServer = (port) => {
    const server = app.listen(port, () => console.log(`Server started at http://localhost:${port}`))
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is in use, trying with port ${port + 1}`);
                startServer(port + 1);
            } else {
                console.log(err);
            }
        });
};

startServer(PORT);
