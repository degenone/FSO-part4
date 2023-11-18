const User = require('../models/user');
require('express-async-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();

loginRouter.post('/', async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        res.status(401).json({ error: 'invalid login' });
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
        res.status(401).json({ error: 'invalid login' });
    }
    const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.SECRET,
        { expiresIn: 3600 }
    );
    res.json({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
