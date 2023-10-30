const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'client')));
const gameLogic = require('./game_logic.js');
const N = gameLogic.N;
const { runGame, env } = gameLogic;

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
    if (nextPlayerId < N) {
      req.session.playerId = nextPlayerId++;
      sessionToPlayer[req.sessionID] = req.session.playerId;
    } else {
      res.status(503).send({ error: 'No more players can join the game.' });
      return;
    }
  }
  const chalk = require('chalk');
  console.log('Session ID:', req.sessionID, '\n', chalk.blue('Player ID:'), req.session.playerId);
  next();
});

app.post('/execute', async (req, res) => {
    console.log("Received request to /execute endpoint");
    let { code } = req.body;
    console.log("Received code:\n ", code); // Log the received code
    try {
        let { index, logs } = runGame(code);
        console.log("Execution result: ", { output: index, logs: logs });
        res.status(200).send({ output: index, logs: logs });
    } catch (error) {
        console.error("Error executing code: ", error.message);
        res.status(500).send({ error: error.message });
    }
});

app.get('/restart', async (req, res) => {
    console.log("Received request to /restart endpoint");
    try {
        gameLogic.make_initial_variables();
        runGame();
        console.log('Variables after restart:', env);
        res.status(200).send({ message: 'Game restarted' });
    } catch (error) {
        console.error("Error restarting game: ", error.message);
        res.status(500).send({ error: error.message });
    }
});

const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let PORT = process.env.PORT || 3000;

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Convert message to string
        var messageString = message.toString();
        console.log('Received message:', messageString);
        // Check if the message is a Blockly workspace XML
        if (messageString.startsWith('<xml')) {
            // Broadcast the Blockly workspace XML to the other client
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                    console.log('Sent message to a client');
                }
            });
        }
    });
});

const startServer = (port) => {
    server.listen(port, () => console.log(`Server started at http://localhost:${port}`))
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
