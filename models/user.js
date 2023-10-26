const mongoose = require('mongoose');

const userScema = new mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
});
userScema.set('toJSON', {
    transform: (doc, returnObj) => {
        returnObj.id = returnObj._id;
        delete returnObj._id;
        delete returnObj.__v;
        delete returnObj.passwordHash;
    },
});

module.exports = mongoose.model('User', userScema);
