const { auth } = require('./auth');

module.exports = {
    createRoutes: (app) => {
        app.get('/tweet-collections', auth, (req, res) => {
            const username = req.username;
            const path = `./users/${username}`;
            const collections = fs.readdirSync(path).map(c => c.replace('.json', ''));
            res.send(collections);
        });

        app.get('/tweet-collections/:id', auth, (req, res) => {
            const username = req.username;
            const id = req.params.id;
            const path = `./users/${username}/${id}.json`;
            if (!fs.existsSync(path))
                return res.status(404).send({ error: 'Collection not found' });
            const data = fs.readFileSync(path);
            const collection = JSON.parse(data);
            res.send(collection);
        });

        app.put('/tweet-collections/:id', auth, (req, res) => {
            const username = req.username;
            const id = req.params.id;
            const path = `./users/${username}/${id}.json`;
            const data = req.body;
            const collection = JSON.stringify(data);
            fs.writeFileSync(path, collection);
            res.send(collection);
        });

        app.delete('/tweet-collections/:id', auth, (req, res) => {
            const username = req.username;
            const id = req.params.id;
            const path = `./users/${username}/${id}.json`;
            if (!fs.existsSync(path))
                return res.status(404).send({ error: 'Collection not found' });
            const data = fs.readFileSync(path);
            const collection = JSON.parse(data);
            fs.unlinkSync(path);
            res.send(collection);
        });
    }
};