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

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true
}));

let sessionToPlayer = {};
let nextPlayerId = 0;

app.use((req, res, next) => {
  if (req.session.playerId === undefined) {
    if (nextPlayerId < 2) { 
      req.session.playerId = nextPlayerId++;
      sessionToPlayer[req.sessionID] = req.session.playerId;
      console.log(`Player ${req.session.playerId} has joined the game.`);
    } else {
      res.status(503).send({ error: 'No more players can join the game.' });
      return;
    }
  }
  const chalk = require('chalk');
  console.log('Session ID:', req.sessionID, '\n', chalk.blue('Player ID:'), req.session.playerId);
  next();
});

let playerCodes = {};

app.post('/execute', async (req, res) => {
    console.log("Received request to /execute endpoint");
    let { code } = req.body;
    let playerId = req.session.playerId;
    console.log(`Received code from player ${playerId}:\n`, code); // Log the received code

    playerCodes[playerId] = code;

    console.log("Player codes: ", playerCodes); // Log the player codes

    if (playerCodes[0] && playerCodes[1]) {
        console.log("Both players have submitted their code. Running the game..."); // Log before running the game
        try {
            let { index, logs } = runGame(playerCodes[0], playerCodes[1]);
            logs = logs || []; // Ensure logs is always an array
            console.log("Execution result: ", { output: index, logs: logs, payoff: gameLogic.env.payoff });
            res.status(200).send({ output: index, logs: logs, payoff: gameLogic.env.payoff });
        } catch (error) {
            console.error("Error executing code: ", error.message);
            res.status(500).send({ error: error.message });
        }
        console.log("Finished processing /execute request");

        // Reset playerCodes
        playerCodes = {};
    } else {
        console.log("Waiting for the other player to submit their code."); // Log when waiting for the other player
        res.status(200).send({ message: 'Code received, waiting for other player.' });
    }
});

app.get('/restart', async (req, res) => {
    console.log("Received request to /restart endpoint");
    try {
        reset();
        console.log('Variables after restart:', env);
        res.status(200).send({ message: 'Game restarted' });
    } catch (error) {
        console.error("Error restarting game: ", error.message);
        res.status(500).send({ error: error.message });
    }
    console.log("Finished processing /restart request");
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
