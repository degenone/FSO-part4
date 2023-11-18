const usersRouter = require('express').Router();
require('express-async-errors');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passwordValidation = require('../utils/passwordValidation');

usersRouter.get('/', async (req, res, next) => {
    const users = await User.find({}).populate('blogs', {
        url: 1,
        title: 1,
        author: 1,
        id: 1,
    });
    res.json(users);
});

usersRouter.post('/', async (req, res, next) => {
    const { username, name, password } = req.body;
    if (!passwordValidation.validate(password)) {
        return res
            .status(400)
            .json({ error: passwordValidation.passwordError });
    }
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
