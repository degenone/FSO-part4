const morgan = require('morgan');
const { info } = require('./logger');

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

const tokenHelper = (req, res, next) => {
    const auth = req.get('authorization');
    if (auth && auth.startsWith('Bearer ')) {
        req.token = auth.replace('Bearer ', '');
    }
    next();
};

module.exports = {
    requestLogger,
    errorHandler,
    tokenHelper,
};
