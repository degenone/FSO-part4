const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

usersRouter.get('/', async (req, res, next) => {
    const users = await User.find({});
    res.json(users);
});

usersRouter.post('/', async (req, res, next) => {
    const { username, name, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        name,
        passwordHash,
    });
    const newUser = await user.save();
    res.status(201).json(newUser);
});

module.exports = usersRouter;
