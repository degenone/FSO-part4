const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        minLength: 3,
        required: true,
    },
});
commentSchema.set('toJSON', {
    transform: (doc, returnObj) => {
        returnObj.id = returnObj._id;
        delete returnObj._id;
        delete returnObj.__v;
    },
});

module.exports = mongoose.model('Comment', commentSchema);
