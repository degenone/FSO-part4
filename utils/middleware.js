const morgan = require('morgan');

morgan.token('body', (request) => {
    const body = JSON.stringify(request.body);
    return body !== '{}' ? body : '-';
})

const requestLogger = () => morgan(':method :url :status :response-time ms :body');

module.exports = { requestLogger };
