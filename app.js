const express = require('express');
const app = express();
const cors = require('cors');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

logger.info('connecting to', config.MONGODB_URL.substring(0, 26));

mongoose
    .connect(config.MONGODB_URL)
    .then(() => logger.info('connected to mongoDB'))
    .catch((error) => logger.error('[ERR] failed to connect', error));

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
    app.use(middleware.requestLogger());
}

app.use('/api/blogs', blogsRouter);

module.exports = app;
