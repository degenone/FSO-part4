const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
});
blogSchema.set('toJSON', {
    transform: (doc, returnObj) => {
        returnObj.id = returnObj._id;
        delete returnObj._id;
        delete returnObj.__v;
    },
});

module.exports = mongoose.model('Blog', blogSchema);
