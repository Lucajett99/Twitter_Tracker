const { jwtSecret } = require('./config.json');

// Authentication middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token)
        return res.status(401).send({ error: 'Missing authorization header' });
    try {
        const { username } = jwt.verify(token, jwtSecret);
        req.username = username;
        next();
    } catch (err) {
        return res.status(401).send({ error: 'Bad token' });
    }
};

module.exports = {
    auth,
    createRoutes: (app) => {
        app.post('/login', (req, res) => {
            const username = req.body.username;
            const path = `./users/${username}`;
            if (!fs.existsSync(path))
                fs.mkdirSync(path);
            const token = jwt.sign({ username }, jwtSecret);
            res.send({ token });
        });
    }
};