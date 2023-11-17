const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { info } = require('./logger');
const User = require('../models/user');

morgan.token('body', (req) => {
    const body = req.body;
    delete body.password;
    const bodyString = JSON.stringify(body);
    return bodyString !== '{}' ? bodyString : '-';
});

const requestLogger = () =>
    morgan(':method :url :status :response-time ms :body');

const errorHandler = (e, req, res, next) => {
    info('name:', e.name);
    if (e.name === 'CastError') {
        return res.status(400).json({ error: 'malformed id' });
    } else if (e.name === 'ValidationError') {
        return res.status(400).json({ error: e.message });
    } else if (e.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: e.message });
    } else if (e.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'token expired' });
    }
    next(e);
};

const tokenHelper = (req) => {
    const auth = req.get('authorization');
    if (auth && auth.startsWith('Bearer ')) {
        return auth.replace('Bearer ', '');
    }
    return null;
};

const tokenExtractor = (req, res, next) => {
    req.token = tokenHelper(req);
    next();
};

const userExtractor = async (req, res, next) => {
    const token = tokenHelper(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
        return res.status(401).json({ error: 'invalid token' });
    }
    req.user = await User.findById(decodedToken.id);
    next();
};

module.exports = {
    requestLogger,
    errorHandler,
    tokenExtractor,
    userExtractor,
};
