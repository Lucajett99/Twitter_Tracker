// Include modules
const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const tweetCollections = require('./tweet-collections');
const auth = require('./auth');
const twitterApi = require('./twitter-api');

// Config constants
const { port } = require('./config.json');

// Setup server environment
if (!fs.existsSync('./users'))
    fs.mkdirSync('./users');

// Creating express app
const app = express();
app.use(cors());

// Routes
auth.createRoutes(app);
tweetCollections.createRoutes(app);
twitterApi.createRoutes(app);

// Start server
const server = http.createServer(app);
server.listen(port, () => console.log('Server listening'));