const http = require('http');
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const recentUrl = 'https://api.twitter.com/2/tweets/search/recent';
const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAMrVIwEAAAAAIzz71ZCU5cAtvPDMmFpOK0gWhDE%3DK1yPC7sVQGGs6xgYh0xnaWGKaFbljoaYmEqj6iaxVQyVRaxsQs'

app.get('/recents', async (req, res) => {
    const rules = req.query.query;
    const response = await axios.get(`${recentUrl}?query=${rules}`, { headers: { authorization: `Bearer ${bearerToken}` } });
    res.send(response.data);
});

const server = http.createServer(app);
server.listen(3000, () => console.log('Server listening'));