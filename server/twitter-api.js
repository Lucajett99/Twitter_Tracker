const axios = require('axios');

const { bearerToken, api } = require('./config.json');

const encodeParam = (param) => param.replace('#', '%23');

module.exports = {
    createRoutes: (app) => {
        app.get('/recent', async (req, res) => {
            const query = encodeParam(req.query.query);
            const response = await axios.get(`${api.v2.tweets.search.recent}?query=${query}`, { headers: { authorization: `Bearer ${bearerToken}` } });
            res.send(response.data);
        });

        app.get('/trends', async (req, res) => {
            const id = 1;
            const response = await axios.get(`${api.v1.trends.place}?id=${id}`, { headers: { authorization: `Bearer ${bearerToken}` } });
            res.send(response.data);
        });
    }
};