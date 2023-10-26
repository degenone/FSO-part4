const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userScema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        validate: {
            validator: (v) => /^[a-zöäå0-9]+$/i.test(v),
            message: () => 'can only contain letters or numbers',
        },
    },
    name: String,
    passwordHash: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
    ],
});
userScema.set('toJSON', {
    transform: (doc, returnObj) => {
        returnObj.id = returnObj._id;
        delete returnObj._id;
        delete returnObj.__v;
        delete returnObj.passwordHash;
    },
});
userScema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userScema);
