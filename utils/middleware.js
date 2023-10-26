const morgan = require('morgan');
const { info } = require('./logger');

morgan.token('body', (request) => {
    const body = request.body;
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
    }
    next(e);
};

module.exports = {
    requestLogger,
    errorHandler,
};
