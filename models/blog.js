const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    url: String,
    likes: Number,
    comments: [String],
});
blogSchema.set('toJSON', {
    transform: (doc, returnObj) => {
        returnObj.id = returnObj._id;
        delete returnObj._id;
        delete returnObj.__v;
    },
});

module.exports = mongoose.model('Blog', blogSchema);
