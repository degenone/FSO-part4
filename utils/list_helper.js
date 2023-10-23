const _ = require('lodash');

const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, item) => sum + item.likes, 0);

const favoriteBlog = (blogs) =>
    blogs.reduce((fav, item) => {
        return item.likes <= (fav.likes ?? -1)
            ? fav
            : {
                  title: item.title,
                  author: item.author,
                  likes: item.likes,
              };
    }, {});

const mostBlogs = (blogs) =>
    _.defaultTo(
        _(blogs)
            .groupBy('author')
            .map((value, key) => ({ author: key, blogs: value.length }))
            .maxBy('blogs'),
        {}
    );

const mostLikes = (blogs) =>
    _.defaultTo(
        _(blogs)
            .groupBy('author')
            .map((value, key) => ({
                author: key,
                likes: _.sumBy(value, (b) => b.likes),
            }))
            .maxBy('likes'),
        {}
    );

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
};
